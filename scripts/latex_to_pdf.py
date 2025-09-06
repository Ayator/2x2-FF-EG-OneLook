import subprocess

def compile_latex_to_pdf(tex_file, output_dir):
    # command as list :3
    cmd = [
        "pdflatex",
        f"-output-directory={output_dir}",
        tex_file
    ]

    # run it, capture output and errors
    result = subprocess.run(cmd, capture_output=True, text=True)

    # print output and errors
    print(result.stdout)

    if result.returncode != 0:
        print("pdflatex failed!")
        print(result.stderr)  # pdflatex standard error
    else:
        print("PDF successfully compiled at", output_dir)

if __name__ == "__main__":
    compile_latex_to_pdf("../latex/2x2_First_Face_Onelook.tex", "../")