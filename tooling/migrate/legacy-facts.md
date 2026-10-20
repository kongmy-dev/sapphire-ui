# Migration reference facts

`legacy-facts.json` records the v3 declarations needed to validate the migration map after retiring the old runtime. It contains stylesheet class names, custom-property reads, token declarations with their original selectors and line numbers, and literal values/property keys from the components referenced by prop migrations.

The facts were extracted from the frozen source before deletion. They are migration input, not generated from the current map: changing a rename cannot change what the old API declared. Both light and dark token resolution, rename completeness, explicit unmapped reasons, and current CSS target validation remain executable in the adjacent tests.
