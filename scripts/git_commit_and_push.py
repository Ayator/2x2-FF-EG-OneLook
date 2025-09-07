import subprocess
import os
import glob

def git_commit_and_push(file_dirs, tex_path, pdf_path, commit_message, repo_path):
    original_cwd = os.getcwd()
    os.chdir(repo_path)
    try:
        # Stage all .svg and .png files in each directory
        for file_dir in file_dirs:
            for ext in ['*.svg', '*.png']:
                for fname in glob.glob(os.path.join(file_dir, ext)):
                    subprocess.run(["git", "add", fname], check=True)
        # Stage the .tex and .pdf files
        print(f"Adding {tex_path} and {pdf_path} to git staging area.")
        print(f"Current working directory: {os.getcwd()}")
        subprocess.run(["git", "add", tex_path], check=True)
        subprocess.run(["git", "add", pdf_path], check=True)
        # Check if any changes to commit
        result = subprocess.run(["git", "diff", "--cached", "--quiet"])
        if result.returncode == 0:
            print("No changes to commit.")
            return
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        subprocess.run(["git", "push"], check=True)
    finally:
        os.chdir(original_cwd)

if __name__ == "__main__":
    file_dirs = [
        "assets/first_face_algs_svg",
        "assets/first_face_algs_png",
        "assets/first_face_case_svg",
        "assets/first_face_case_png"
    ]
    tex_path = os.path.join("../latex", "2x2_First_Face_Onelook.tex")
    pdf_path = os.path.join("../", "2x2_First_Face_Onelook.pdf")
    commit_message = "Update alg images and documents"
    repo_path = "../"
    git_commit_and_push(file_dirs, tex_path, pdf_path, commit_message, repo_path)