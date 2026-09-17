"""
Vision2Venture — Test Runner
============================
Runs every test_*.py validation script in this folder as a subprocess and
reports PASS (exit code 0) / FAIL for each, with a summary at the end.

The individual test_*.py files are print-based validation scripts (they exercise
the ML models and services and print their outputs). This runner turns them into
a single, repeatable, CI-friendly check.

Usage (from backend/):
    python run_all_tests.py
    python run_all_tests.py -v      # also print each test's output
"""
import os
import sys
import glob
import time
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
VERBOSE = "-v" in sys.argv or "--verbose" in sys.argv


def main():
    test_files = sorted(glob.glob(os.path.join(HERE, "test_*.py")))
    if not test_files:
        print("No test_*.py files found.")
        return 0

    print("=" * 70)
    print(f"VISION2VENTURE TEST RUNNER — {len(test_files)} scripts")
    print("=" * 70)

    passed, failed = 0, 0
    results = []
    for path in test_files:
        name = os.path.basename(path)
        start = time.time()
        try:
            proc = subprocess.run(
                [sys.executable, path],
                cwd=HERE,
                capture_output=True,
                text=True,
                timeout=180,
            )
            ok = proc.returncode == 0
        except subprocess.TimeoutExpired:
            ok = False
            proc = None
        dt = time.time() - start

        status = "PASS" if ok else "FAIL"
        (passed if ok else failed).__int__  # noqa (readability)
        if ok:
            passed += 1
        else:
            failed += 1
        results.append((name, status, dt))
        print(f"  [{status}] {name:32s} ({dt:5.1f}s)")
        if VERBOSE and proc is not None:
            print("  " + "-" * 60)
            for line in (proc.stdout or "").splitlines():
                print("    " + line)
            if proc.returncode != 0 and proc.stderr:
                print("    STDERR:")
                for line in proc.stderr.splitlines()[-15:]:
                    print("    " + line)
            print("  " + "-" * 60)

    print("=" * 70)
    print(f"SUMMARY: {passed} passed, {failed} failed, {len(test_files)} total")
    print("=" * 70)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
