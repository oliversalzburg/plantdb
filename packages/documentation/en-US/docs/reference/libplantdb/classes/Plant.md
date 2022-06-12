[@plantdb/libplantdb](../README.md) / [Exports](../modules.md) / Plant

# Class: Plant

## Accessors

### ecMax

• `get` **ecMax**(): `undefined` \| `number`

The maximum EC value for this plant.

**Returns**

`undefined` \| `number`

**Defined in**

[Plant.ts:248](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L248)

---

### ecMin

• `get` **ecMin**(): `undefined` \| `number`

The minium EC value for this plant.

**Returns**

`undefined` \| `number`

**Defined in**

[Plant.ts:241](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L241)

---

### id

• `get` **id**(): `string`

The ID of the plant.

**Returns**

`string`

**Defined in**

[Plant.ts:163](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L163)

---

### isArchived

• `get` **isArchived**(): `undefined` \| `boolean`

Has this plant been archived?
Archived plants are usually ignored in primary use cases.

**Returns**

`undefined` \| `boolean`

**Defined in**

[Plant.ts:171](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L171)

---

### kind

• `get` **kind**(): `undefined` \| `string` \| `string`[]

The kind(s) of the plant.

**Returns**

`undefined` \| `string` \| `string`[]

**Defined in**

[Plant.ts:185](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L185)

---

### location

• `get` **location**(): `undefined` \| `string` \| `string`[]

The current location of the plant.

**Returns**

`undefined` \| `string` \| `string`[]

**Defined in**

[Plant.ts:220](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L220)

---

### log

• `get` **log**(): [`LogEntry`](LogEntry.md)[]

The log entries in the PlantDB relating to this plant.

**Returns**

[`LogEntry`](LogEntry.md)[]

**Defined in**

[Plant.ts:283](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L283)

---

### logEntryLatest

• `get` **logEntryLatest**(): `undefined` \| [`LogEntry`](LogEntry.md)

Convenience access to latest log entry for this plant.

**Returns**

`undefined` \| [`LogEntry`](LogEntry.md)

**Defined in**

[Plant.ts:297](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L297)

---

### logEntryOldest

• `get` **logEntryOldest**(): `undefined` \| [`LogEntry`](LogEntry.md)

Convenience access to first log entry for this plant.

**Returns**

`undefined` \| [`LogEntry`](LogEntry.md)

**Defined in**

[Plant.ts:290](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L290)

---

### name

• `get` **name**(): `undefined` \| `string`

The name of the plant.

**Returns**

`undefined` \| `string`

**Defined in**

[Plant.ts:178](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L178)

---

### notes

• `get` **notes**(): `undefined` \| `string`

Any notes about this plant.

**Returns**

`undefined` \| `string`

**Defined in**

[Plant.ts:269](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L269)

---

### onSaucer

• `get` **onSaucer**(): `undefined` \| `boolean`

Does the plant current sit on a saucer?

**Returns**

`undefined` \| `boolean`

**Defined in**

[Plant.ts:213](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L213)

---

### phMax

• `get` **phMax**(): `undefined` \| `number`

The maximum pH value for this plant.

**Returns**

`undefined` \| `number`

**Defined in**

[Plant.ts:234](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L234)

---

### phMin

• `get` **phMin**(): `undefined` \| `number`

The minimum pH value for this plant.

**Returns**

`undefined` \| `number`

**Defined in**

[Plant.ts:227](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L227)

---

### plantDb

• `get` **plantDb**(): [`PlantDB`](PlantDB.md)

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[Plant.ts:156](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L156)

---

### plantgeekId

• `get` **plantgeekId**(): `undefined` \| `string` \| `string`[]

ID(s) of plant(s) on plantgeek.co that provide more information about this plant.

**Returns**

`undefined` \| `string` \| `string`[]

**Defined in**

[Plant.ts:276](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L276)

---

### potColor

• `get` **potColor**(): `undefined` \| `string`

The color of the pot.

**Returns**

`undefined` \| `string`

**Defined in**

[Plant.ts:206](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L206)

---

### potShapeTop

• `get` **potShapeTop**(): `undefined` \| `string`

The shape of the pot, when viewed from above.

**Returns**

`undefined` \| `string`

**Defined in**

[Plant.ts:199](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L199)

---

### substrate

• `get` **substrate**(): `undefined` \| `string` \| `string`[]

The current substrate(s) the plant is planted in.

**Returns**

`undefined` \| `string` \| `string`[]

**Defined in**

[Plant.ts:192](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L192)

---

### tempMax

• `get` **tempMax**(): `undefined` \| `number`

The maximum temperature for this plant.

**Returns**

`undefined` \| `number`

**Defined in**

[Plant.ts:262](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L262)

---

### tempMin

• `get` **tempMin**(): `undefined` \| `number`

The minimum temperature for this plant.

**Returns**

`undefined` \| `number`

**Defined in**

[Plant.ts:255](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L255)

## Methods

### toCSVData

▸ **toCSVData**(`databaseFormat`): (`undefined` \| `string` \| `number` \| `boolean`)[]

Serialize the `Plant` so it can be be turned into CSV.

**Parameters**

| Name             | Type                                  | Description                                          |
| :--------------- | :------------------------------------ | :--------------------------------------------------- |
| `databaseFormat` | [`DatabaseFormat`](DatabaseFormat.md) | The `DatabaseFormat` to use when serializing values. |

**Returns**

(`undefined` \| `string` \| `number` \| `boolean`)[]

The `Plant` ready to be serialized into CSV.

**Defined in**

[Plant.ts:380](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L380)

---

### toJSON

▸ **toJSON**(): [`PlantSerialized`](../modules.md#plantserialized)

Pre-serialize the `Plant` into an object ready to be turned into a JSON string.

**Returns**

[`PlantSerialized`](../modules.md#plantserialized)

The `Plant` as JSON-serializable object.

**Defined in**

[Plant.ts:468](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L468)

---

### toJSObject

▸ **toJSObject**(): [`PlantSerialized`](../modules.md#plantserialized)

Serialize this plant into a plain JS hash.

**Returns**

[`PlantSerialized`](../modules.md#plantserialized)

A simple hash with all of this plant's properties.

**Defined in**

[Plant.ts:441](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L441)

---

### toString

▸ **toString**(): `string`

**Returns**

`string`

**Defined in**

[Plant.ts:312](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L312)

---

### fromCSVData

▸ `Static` **fromCSVData**(`plantDb`, `dataRow`): [`Plant`](Plant.md)

Constructs a `Plant` from CSV data.

**Parameters**

| Name      | Type                    | Description                                    |
| :-------- | :---------------------- | :--------------------------------------------- |
| `plantDb` | [`PlantDB`](PlantDB.md) | The `PlantDB` to create the plant in.          |
| `dataRow` | `string`[]              | The strings that were read from the CSV input. |

**Returns**

[`Plant`](Plant.md)

The constructed `Plant`.

**Defined in**

[Plant.ts:351](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L351)

---

### fromJSON

▸ `Static` **fromJSON**(`plantDb`, `dataString`): [`Plant`](Plant.md)

Parse a JSON string and construct a new `Plant` from it.

**Parameters**

| Name         | Type                    | Description                           |
| :----------- | :---------------------- | :------------------------------------ |
| `plantDb`    | [`PlantDB`](PlantDB.md) | The `PlantDB` this `Plant` belongs to |
| `dataString` | `string`                | The JSON-serialized plant.            |

**Returns**

[`Plant`](Plant.md)

The new `Plant`.

**Defined in**

[Plant.ts:431](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L431)

---

### fromJSObject

▸ `Static` **fromJSObject**(`plantDb`, `dataObject`): [`Plant`](Plant.md)

**Parameters**

| Name         | Type                                               |
| :----------- | :------------------------------------------------- |
| `plantDb`    | [`PlantDB`](PlantDB.md)                            |
| `dataObject` | [`PlantSerialized`](../modules.md#plantserialized) |

**Returns**

[`Plant`](Plant.md)

**Defined in**

[Plant.ts:403](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L403)

---

### fromPlant

▸ `Static` **fromPlant**(`other`, `initializer?`): [`Plant`](Plant.md)

Constructs a new `Plant`, given another plant as a template and a hash with additional properties.

**Parameters**

| Name           | Type                            | Description                                         |
| :------------- | :------------------------------ | :-------------------------------------------------- |
| `other`        | [`Plant`](Plant.md)             | The `Plant` to copy properties from.                |
| `initializer?` | `Partial`<[`Plant`](Plant.md)\> | A hash containing properties to add to or override. |

**Returns**

[`Plant`](Plant.md)

A new `Plant` with the `other` plant and the initializer properties merged into it.

**Defined in**

[Plant.ts:323](https://github.com/oliversalzburg/plantdb/blob/d62bb39/packages/libplantdb/source/Plant.ts#L323)
