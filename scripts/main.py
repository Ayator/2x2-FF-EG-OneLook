import download_algs
import svg_to_png
import git_commit_and_push
import insert_to_sheet
import export_to_latex
import latex_to_pdf

def update_sets(setNames = None, row = None, col = None):
    # Download SVG files based on the provided set names and optional row/column filters
    svgFilenames = download_algs.downloadFilesFromJSON(
        '../assets/algs_numbers.json',
        "../assets/first_face_algs_svg",
        "../assets/first_face_case_svg",
        onlySets=setNames,
        row=row,
        col=col
    )
    # Convert downloaded SVG files to PNG format
    pngFilenames = svg_to_png.convert_svg_to_png(
        "../assets/first_face_algs_svg",
        "../assets/first_face_algs_png",
        filenames=svgFilenames
    )
    svg_to_png.convert_svg_to_png(
        "../assets/first_face_case_svg",
        "../assets/first_face_case_png",
        filenames=svgFilenames
    )
    # Generate LaTeX table and compile it to PDF
    export_to_latex.generate_latex_table(
        "../assets/algs_numbers.json",
        "../assets/first_face_algs_png",
        "../latex/2x2_First_Face_Onelook.tex"
    )
    latex_to_pdf.compile_latex_to_pdf("../latex/2x2_First_Face_Onelook.tex", "../")
    # Commit and push changes to the repository
    git_commit_and_push.git_commit_and_push([
            "assets/first_face_algs_svg",
            "assets/first_face_algs_png",
            "assets/first_face_case_svg",
            "assets/first_face_case_png"
        ],
        "latex/2x2_First_Face_Onelook.tex",
        "2x2_First_Face_Onelook.pdf",
        "Update alg images and documents", "../"
    )
    # Insert the new PNG images into the Google Sheet
    insert_to_sheet.insert_images_to_sheet(filenames=pngFilenames)

if __name__ == "__main__":
    update_sets()  # Update all sets
    # update_sets(["TCLL+"])
    # update_sets(["LS-123"], 1, 2)
