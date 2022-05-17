# libplantdb

A JavaScript/TypeScript SDK to build PlantDB applications.

## Examples

Its functionality is best explored through one of the consuming applications:

-   libplantdb powers the [PlantDB Playground](https://github.com/oliversalzburg/plantdb/tree/main/packages/plant-playground)

## Philosophy notes

1. "User-supplied" means CSV export from a PlantDB spreadsheet.

    This is the **only** kind of data up for interpretation. As users introduce PlantDB data into a PlantDB application, augmenting that data is fundamental. Reducing friction is key.

    Any other data can be assumed to be purely transactional and should not be assumed to be human-authored.

2. Empty fields in user-supplied data are interpreted to mean `undefined`.

    They are **not normalized** to empty string or any other default. All consumers must handle this correctly.

3. Fields accept multiple values, separated by newline.

    When the user explicitly enters multiple lines into a cell in their spreadsheet, this is to mean they want multiple values stored in that field. This must be supported through arrays and these fields must be distinct from single-value fields.
