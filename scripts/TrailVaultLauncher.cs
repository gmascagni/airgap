using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace DigitalTrailLabs.TrailVault
{
    static class Program
    {
        private static Mutex appMutex;
        private static Process serverProcess;
        private static NotifyIcon trayIcon;
        private static string appRootDir;

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            appRootDir = AppDomain.CurrentDomain.BaseDirectory;
            if (!File.Exists(Path.Combine(appRootDir, "services", "live_appliance_server.py")))
            {
                // Fallback to parent directory if running from scripts/ or bin/
                DirectoryInfo parentInfo = Directory.GetParent(appRootDir);
                string parent = parentInfo != null ? parentInfo.FullName : null;
                if (parent != null && File.Exists(Path.Combine(parent, "services", "live_appliance_server.py")))
                {
                    appRootDir = parent;
                }
            }

            // Single instance guard
            bool createdNew;
            appMutex = new Mutex(true, "DigitalTrailLabs_TrailVault_SingleInstance_Mutex", out createdNew);
            if (!createdNew)
            {
                // Already running - verify engine is active before opening browser
                EnsureOllamaRunning();
                EnsureServerRunning();
                OpenUrl("http://127.0.0.1:8000/app/index.html");
                return;
            }

            // Ensure LLM Engine and Server are running
            EnsureOllamaRunning();
            EnsureServerRunning();

            // Setup Tray Icon & Context Menu
            SetupTrayIcon();

            // Open browser to Intelligence Workbench
            OpenUrl("http://127.0.0.1:8000/app/index.html");

            // Run application loop for tray icon
            Application.Run();
        }

        static bool IsOllamaAlive()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:11434/api/tags");
                req.Timeout = 800;
                req.Method = "GET";
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        static void EnsureOllamaRunning()
        {
            if (IsOllamaAlive()) return;
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo("ollama", "serve");
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                Process.Start(psi);
            }
            catch { }
        }

        static bool IsServerAlive()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:8000/api/v1/status");
                req.Timeout = 1200;
                req.Method = "GET";
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        static void EnsureServerRunning()
        {
            if (IsServerAlive())
            {
                return;
            }

            string pythonExe = FindPythonExecutable();
            string serverScript = Path.Combine(appRootDir, "services", "live_appliance_server.py");

            if (!File.Exists(serverScript))
            {
                MessageBox.Show(
                    "TrailVault backend service script not found at:\n" + serverScript,
                    "TrailVault™ Enterprise - Missing Component",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = pythonExe;
            psi.Arguments = "\"" + serverScript + "\"";
            psi.WorkingDirectory = appRootDir;
            psi.CreateNoWindow = true;
            psi.UseShellExecute = false;
            psi.WindowStyle = ProcessWindowStyle.Hidden;

            try
            {
                serverProcess = Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Failed to launch TrailVault background engine:\n" + ex.Message,
                    "TrailVault™ Enterprise Startup Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            // Wait up to 30 seconds for server to respond (model load takes ~4-6 seconds)
            for (int i = 0; i < 60; i++)
            {
                Thread.Sleep(500);
                if (IsServerAlive())
                {
                    break;
                }
                if (serverProcess != null && serverProcess.HasExited)
                {
                    break;
                }
            }
        }

        static string FindPythonExecutable()
        {
            // 1. Embedded python on NVMe drive
            string embedPath = Path.Combine(appRootDir, "python_embed", "python.exe");
            if (File.Exists(embedPath)) return embedPath;

            // 2. Portable python folder
            string portablePath = Path.Combine(appRootDir, "python", "python.exe");
            if (File.Exists(portablePath)) return portablePath;

            // 3. User standard python path
            string userPy = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "Python", "Python312", "python.exe");
            if (File.Exists(userPy)) return userPy;

            // 4. Default system PATH python
            return "python.exe";
        }

        static void SetupTrayIcon()
        {
            trayIcon = new NotifyIcon();
            trayIcon.Text = "TrailVault™ Enterprise (v5.1.0 IronTrail)";
            
            // Draw a clean shield icon dynamically
            Bitmap bmp = new Bitmap(32, 32);
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.Clear(Color.Transparent);
                using (Brush b = new SolidBrush(Color.FromArgb(14, 165, 233))) // Cyan-500
                {
                    Point[] shield = new Point[] {
                        new Point(16, 2),
                        new Point(28, 6),
                        new Point(28, 18),
                        new Point(16, 30),
                        new Point(4, 18),
                        new Point(4, 6)
                    };
                    g.FillPolygon(b, shield);
                }
                using (Pen p = new Pen(Color.FromArgb(255, 255, 255), 2))
                {
                    g.DrawLine(p, 10, 16, 14, 21);
                    g.DrawLine(p, 14, 21, 23, 10);
                }
            }
            trayIcon.Icon = Icon.FromHandle(bmp.GetHicon());
            trayIcon.Visible = true;

            ContextMenuStrip menu = new ContextMenuStrip();
            menu.Items.Add("TrailVault™ Enterprise v5.1.0 (ONLINE)", null, (s, e) => OpenUrl("http://127.0.0.1:8000/app/index.html")).Font = new Font(menu.Font, FontStyle.Bold);
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add("Open Intelligence Workspace", null, (s, e) => OpenUrl("http://127.0.0.1:8000/app/index.html"));
            menu.Items.Add("Open Technical Documentation Hub", null, (s, e) => OpenUrl("http://127.0.0.1:8000/noc/index.html"));
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add("Purge Customer Session Files (Application Level)", null, (s, e) => ExecutePurge());
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add("Exit & Shut Down Engine", null, (s, e) => ExitApplication());

            trayIcon.ContextMenuStrip = menu;
            trayIcon.DoubleClick += (s, e) => OpenUrl("http://127.0.0.1:8000/app/index.html");

            trayIcon.ShowBalloonTip(
                4000,
                "TrailVault™ Enterprise Online",
                "Loopback locked (127.0.0.1:8000). Zero telemetry enforced.",
                ToolTipIcon.Info
            );
        }

        static void OpenUrl(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not open browser: " + ex.Message);
            }
        }

        static void ExecutePurge()
        {
            DialogResult res = MessageBox.Show(
                "To purge customer documents under NIST SP 800-88 Rev 1 controls with immutable cryptographic audit logging, please confirm within the authenticated TrailVault Workbench (or execute scripts/nvme_cryptographic_erase.ps1 for media sanitization).\n\nOpen Workbench to confirm purge now?",
                "TrailVault™ - Purge Customer Session",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );

            if (res == DialogResult.Yes)
            {
                OpenUrl("http://127.0.0.1:8000/app/index.html?action=purge");
            }
        }

        static void ExitApplication()
        {
            trayIcon.Visible = false;
            if (serverProcess != null && !serverProcess.HasExited)
            {
                try
                {
                    ProcessStartInfo killPsi = new ProcessStartInfo("taskkill", "/F /T /PID " + serverProcess.Id);
                    killPsi.CreateNoWindow = true;
                    killPsi.UseShellExecute = false;
                    killPsi.WindowStyle = ProcessWindowStyle.Hidden;
                    Process killProc = Process.Start(killPsi);
                    if (killProc != null) killProc.WaitForExit(3000);
                }
                catch
                {
                    try { serverProcess.Kill(); } catch { }
                }
            }
            Application.Exit();
        }
    }
}
