# AGENTS.md instructions for C:\Users\user\Documents\auto field report

CRITICAL NON-REGRESSION RULE — DO NOT CHANGE WORKING PARTS

Do NOT modify anything that is already working correctly.

This project already has several working modules and flows. Your job is targeted debugging and integration, not redesign.

Strict rules:
1. Preserve all working UI, UX, routes, buttons, forms, data flows, and module access.
2. Do not refactor working code unless it is directly required to fix one of the listed bugs.
3. Do not rename existing keys, routes, components, functions, or storage structures unless migration/backward compatibility is included.
4. Do not change Daily Report preview because it is already correct. Only make PDF export match the correct preview.
5. Do not change ROI Simulator logic because the calculation is already correct. Only optimize performance.
6. Do not change existing dashboard navigation except to add/fix access for Admin Tools, Absensi Karyawan, and Module Generator if needed.
7. Do not replace existing modules with new versions.
8. Do not simplify by deleting features.
9. Do not make visual redesigns unless required to fix layout breakage.
10. Every change must be minimal, isolated, and justified by one of the listed issues.

Before editing any file:
- Identify whether the file/module is working.
- If working, leave it untouched unless the bug specifically requires touching it.
- Prefer wrapper/adaptor fixes over invasive rewrites.
- Preserve existing behavior by default.

After editing:
- Run regression checks for all modules, not only the broken ones.
- Confirm that previously working features still work exactly as before.
- In final report, explicitly list:
  - what was changed
  - what was intentionally left unchanged
  - why each changed file needed to be changed