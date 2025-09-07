***

# 2x2 First Face Algorithms (Onelook)

A complete open-source collection of illustrated 2x2 cube First-Face algorithms, generated with onelook recognition, case images, PNG and SVG algorithm diagrams, auto-generated LaTeX/PDF tables, and Google Sheets integration.

## Table of Contents

- [Files and Structure](#files-and-structure)
- [Download PDF](#download-pdf)
- [Case Example](#case-example)
- [How to Use/Build](#how-to-usebuild)
- [Credits](#credits)
- [License](#license)

***

## Files and Structure

| Folder / File                       | Description                                               |
|-------------------------------------|-----------------------------------------------------------|
| `assets/algs_numbers.json`          | All First Face algorithms and groupings in structured JSON.|
| `assets/first_face_algs_svg/`       | SVGs for every algorithm diagram (for LaTeX & reference). |
| `assets/first_face_case_svg/`       | SVGs for case-only images (unlabeled).                    |
| `assets/first_face_algs_png/`       | Auto-converted PNGs of all algorithm diagrams.            |
| `assets/first_face_case_png/`       | PNGs for all cases (unlabeled).                           |
| `latex/2x2_First_Face_Onelook.tex`  | Auto-generated LaTeX table covering all cases.            |
| `2x2_First_Face_Onelook.pdf`        | **Compiled PDF** (ready-to-use for reference/print).      |
| `git_commit_and_push.py`            | Automates git adds/commits for code and diagrams.         |
| `download_algs.py`, `svg_to_png.py`, ... | Scripts for image and data generation.               |
| `insert_to_sheet.py`                | Syncs all diagrams & algorithm text to a Google Sheet.    |

***

## Download PDF

- [**Direct link to latest PDF (view/download)**](./2x2_First_Face_Onelook.pdf)

***

## Case Examples

| TCLL- Case 1 | TCLL- Case 3 |
|--------|--------|
| <img src="assets/first_face_algs_svg/TCLL-%5B0%5D%5B1%5D%3DRU'R'U'R.svg" width="180"><br>**Setup:** *R' U R U R'*<br>**Algorithm:** *R U' R' U' R*<br>**Outcome:** UFR <- [I], UFL <- [II], UBL <- [III] | <img src="assets/first_face_algs_svg/TCLL-%5B0%5D%5B3%5D%3DLU'L'U'L.svg" width="180"><br>**Setup:** *L' U L U L'*<br>**Algorithm:** *L U' L' U' L*<br>**Outcome:** UFR <- [I], UFL <- [II], UBL <- [III] |


***

## How to Use/Build

1. **Dependencies:** Python 3, Inkscape, LaTeX with pdflatex, Google Cloud credentials.
2. **Generate images:**  
   - Run `python download_algs.py`
   - Run `python svg_to_png.py`
3. **Auto-generate LaTeX/PDF:**  
   - Run `python export_to_latex.py`
   - Compile with:  
     ```bash
     pdflatex -output-directory=build latex/2x2_First_Face_Onelook.tex
     ```
     or use `python latex_to_pdf.py`
4. **Commit changes:**  
   - Run `python git_commit_and_push.py`
5. **Update Google Sheet:**  
   - Run `python insert_to_sheet.py`

For full automation and batch update, use `python main.py`.

***

## Credits

Developed by [Victor Ayala](https://www.worldcubeassociation.org/persons/2014AYAL02?event=222).
Auto-generation by custom scripts and algorithmic formatting tools.

- **visualcube**: For rendering high-quality cube images.
- **cube.rider.biz**: For online algorithm transformation reference.
- **CubeRoot**: For source of many first face algorithms.

***

## License

MIT License (see [LICENSE](LICENSE))  
Diagrams and scripts may be freely reused with attribution.

***