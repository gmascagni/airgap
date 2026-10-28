import os
import sys
import time
from pathlib import Path


def run_benchmark() -> None:
    drive_root = Path(__file__).resolve().parent.parent
    test_file = drive_root / "_nvme_bench_temp.bin"
    size_mb = 1024  # 1 GB
    block_size = 16 * 1024 * 1024  # 16 MB
    blocks = size_mb // 16
    payload = os.urandom(block_size)

    print(f"Target NVMe Path: {drive_root}")
    print("----------------------------------------------------------------------------")
    print("[1/2] Running 1,024 MB (1.0 GB) Hardware-Flushed Sequential WRITE Test...")
    t0 = time.perf_counter()
    with open(test_file, "wb", buffering=0) as f:
        for _ in range(blocks):
            f.write(payload)
        os.fsync(f.fileno())
    w_sec = time.perf_counter() - t0
    w_mbps = size_mb / w_sec
    print(f"      -> WRITE SPEED: {w_mbps:,.1f} MB/s ({w_mbps / 1024:.2f} GB/s)  [Elapsed: {w_sec:.2f}s]")

    print("")
    print("[2/2] Running 1,024 MB (1.0 GB) Unbuffered Sequential READ Test...")
    t1 = time.perf_counter()
    with open(test_file, "rb", buffering=0) as f:
        while f.read(block_size):
            pass
    r_sec = time.perf_counter() - t1
    r_mbps = size_mb / r_sec
    print(f"      -> READ SPEED:  {r_mbps:,.1f} MB/s ({r_mbps / 1024:.2f} GB/s)  [Elapsed: {r_sec:.2f}s]")

    try:
        test_file.unlink()
    except Exception:
        pass
    print("----------------------------------------------------------------------------")


if __name__ == "__main__":
    run_benchmark()
