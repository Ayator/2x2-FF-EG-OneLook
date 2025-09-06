import subprocess
import os

def git_commit_and_push(file_dirs, commit_message, repo_path):
    original_cwd = os.getcwd()
    os.chdir(repo_path)
    try:
        for file_dir in file_dirs:
            subprocess.run(["git", "add", os.path.join(file_dir, '*.svg')], shell=True)
            subprocess.run(["git", "add", os.path.join(file_dir, '*.png')], shell=True)

        subprocess.run(["git", "commit", "-m", commit_message], check=True)

        subprocess.run(["git", "push"], check=True)
    finally:
        os.chdir(original_cwd)

if __name__ == "__main__":
    file_dirs = ["../first_face_algs_svg", "../first_face_algs_png"]
    commit_message = "Update alg images"
    repo_path = "../"
    git_commit_and_push(file_dirs, commit_message, repo_path)