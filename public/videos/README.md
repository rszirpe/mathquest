# Grade intro videos

Drop the six per-grade orientation clips here with these **exact** filenames. Each plays over the
Home screen when a child opens a grade they have zero progress on (see
`src/components/IntroVideoOverlay.tsx`). Files in `public/` are copied verbatim into the build
(`dist/videos/...`) and served relative to the site base.

| Grade | Filename                                          |
| ----- | ------------------------------------------------- |
| K     | `Building_a_Math_Foundation_Kindergarden.mp4`     |
| 1     | `CA_First-Grade_Math_Framework.mp4`               |
| 2     | `Illusion_of_Mastery_in_Math_second_grade.mp4`    |
| 3     | `3rd_Grade_CA_CCSSM_Explained.mp4`                |
| 4     | `4th_Grade_Math_Blueprint.mp4`                     |
| 5     | `CA_5th-Grade_Math_Curriculum.mp4`                |

Notes:
- Keep the names identical — the grade → filename mapping in `IntroVideoOverlay.tsx` is exact.
- GitHub rejects any single committed file larger than 100MB (no Git LFS is configured here); keep
  clips under that, or host them externally and switch the mapping to URLs.
