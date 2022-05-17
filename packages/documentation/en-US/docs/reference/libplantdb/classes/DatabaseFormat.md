[@plantdb/libplantdb](../README.md) / [Exports](../modules.md) / DatabaseFormat

# Class: DatabaseFormat

Describes the format of records in a PlantDB document.

## Constructors

### constructor

• **new DatabaseFormat**()

## Accessors

### columnSeparator

• `get` **columnSeparator**(): `string`

The character separating the individual columns of values in the document.

**Returns**

`string`

**Defined in**

[DatabaseFormat.ts:85](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L85)

---

### dateFormat

• `get` **dateFormat**(): `string`

The format that is used to record date/time values in the document.

**`see`** https://moment.github.io/luxon/#/parsing?id=table-of-tokens

**Returns**

`string`

**Defined in**

[DatabaseFormat.ts:93](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L93)

---

### hasHeaderRow

• `get` **hasHeaderRow**(): `boolean`

Whether this document has an initial row that contains the labels for the columns in the document.

**Returns**

`boolean`

**Defined in**

[DatabaseFormat.ts:100](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L100)

---

### timezone

• `get` **timezone**(): `string`

The time zone in which the date/time values in the document were recorded.

**`see`** https://moment.github.io/luxon/#/zones?id=specifying-a-zone

**Returns**

`string`

**Defined in**

[DatabaseFormat.ts:108](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L108)

---

### typeMap

• `get` **typeMap**(): `Map`<`string`, `"Acquisition"` \| `"Fertilization"` \| `"Measurement"` \| `"Observation"` \| `"Pruning"` \| `"Relocation"` \| `"Repotting"` \| `"Shaping"` \| `"Watering"` \| `"PestControl"` \| `"PestInfestation"` \| `"RootPruning"`\>

A map of strings that appear as event identifiers in the document and the Plant-DB event types
they correlate to.

**Returns**

`Map`<`string`, `"Acquisition"` \| `"Fertilization"` \| `"Measurement"` \| `"Observation"` \| `"Pruning"` \| `"Relocation"` \| `"Repotting"` \| `"Shaping"` \| `"Watering"` \| `"PestControl"` \| `"PestInfestation"` \| `"RootPruning"`\>

**Defined in**

[DatabaseFormat.ts:116](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L116)

## Methods

### toJSON

▸ **toJSON**(): [`DatabaseFormatSerialized`](../modules.md#databaseformatserialized)

Pre-serialize the `DatabaseFormat` into an object ready to be turned into a JSON string.

**Returns**

[`DatabaseFormatSerialized`](../modules.md#databaseformatserialized)

The `DatabaseFormat` as a JSON-serializable object.

**Defined in**

[DatabaseFormat.ts:190](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L190)

---

### toJSObject

▸ **toJSObject**(): [`DatabaseFormatSerialized`](../modules.md#databaseformatserialized)

Convert the `DatabaseFormat` into a plain JS object.

**Returns**

[`DatabaseFormatSerialized`](../modules.md#databaseformatserialized)

The `DatabaseFormat` as a plain JS object.

**Defined in**

[DatabaseFormat.ts:176](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L176)

---

### withNewTypeMap

▸ **withNewTypeMap**(`typeMap`): [`DatabaseFormat`](DatabaseFormat.md)

Creates a new `DatabaseFormat`, based on this one, but with a new type map.

**Parameters**

| Name      | Type                                                                                                                                                                                                                                       | Description                                      |
| :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| `typeMap` | `Map`<`string`, `"Acquisition"` \| `"Fertilization"` \| `"Measurement"` \| `"Observation"` \| `"Pruning"` \| `"Relocation"` \| `"Repotting"` \| `"Shaping"` \| `"Watering"` \| `"PestControl"` \| `"PestInfestation"` \| `"RootPruning"`\> | The type map to use in the new `DatabaseFormat`. |

**Returns**

[`DatabaseFormat`](DatabaseFormat.md)

The new `DatabaseFormat`.

**Defined in**

[DatabaseFormat.ts:125](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L125)

---

### fromDatabaseFormat

▸ `Static` **fromDatabaseFormat**(`other`): [`DatabaseFormat`](DatabaseFormat.md)

Creates a new `DatabaseFormat`, with the values of another `DatabaseFormat`.

**Parameters**

| Name    | Type                                  | Description                               |
| :------ | :------------------------------------ | :---------------------------------------- |
| `other` | [`DatabaseFormat`](DatabaseFormat.md) | The `DatabaseFormat` to copy values from. |

**Returns**

[`DatabaseFormat`](DatabaseFormat.md)

The new `DatabaseFormat`.

**Defined in**

[DatabaseFormat.ts:136](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L136)

---

### fromJSON

▸ `Static` **fromJSON**(`dataString`): [`DatabaseFormat`](DatabaseFormat.md)

Parse a JSON string and construct a new `DatabaseFormat` from it.

**Parameters**

| Name         | Type     | Description                          |
| :----------- | :------- | :----------------------------------- |
| `dataString` | `string` | The JSON-serialized database format. |

**Returns**

[`DatabaseFormat`](DatabaseFormat.md)

The new `DatabaseFormat`.

**Defined in**

[DatabaseFormat.ts:167](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L167)

---

### fromJSObject

▸ `Static` **fromJSObject**(`data`): [`DatabaseFormat`](DatabaseFormat.md)

Parse a JS object and construct a new `DatabaseFormat` from it.

**Parameters**

| Name   | Type                                                                             | Description                      |
| :----- | :------------------------------------------------------------------------------- | :------------------------------- |
| `data` | `Partial`<[`DatabaseFormatSerialized`](../modules.md#databaseformatserialized)\> | The serialized `DatabaseFormat`. |

**Returns**

[`DatabaseFormat`](DatabaseFormat.md)

The new `DatabaseFormat`.

**Defined in**

[DatabaseFormat.ts:151](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/DatabaseFormat.ts#L151)
