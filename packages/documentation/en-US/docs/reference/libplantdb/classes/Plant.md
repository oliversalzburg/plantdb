[@plantdb/libplantdb](../README.md) / [Exports](../modules.md) / Plant

# Class: Plant

## Accessors

### ecIdeal

• `get` **ecIdeal**(): `undefined` \| `number`

**Returns**

`undefined` \| `number`

**Defined in**

[Plant.ts:148](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L148)

---

### id

• `get` **id**(): `string`

**Returns**

`string`

**Defined in**

[Plant.ts:112](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L112)

---

### indexableText

• `get` **indexableText**(): `string`

**Returns**

`string`

**Defined in**

[Plant.ts:160](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L160)

---

### kind

• `get` **kind**(): `undefined` \| `string` \| `string`[]

**Returns**

`undefined` \| `string` \| `string`[]

**Defined in**

[Plant.ts:120](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L120)

---

### location

• `get` **location**(): `undefined` \| `string`

**Returns**

`undefined` \| `string`

**Defined in**

[Plant.ts:140](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L140)

---

### log

• `get` **log**(): [`LogEntry`](LogEntry.md)[]

**Returns**

[`LogEntry`](LogEntry.md)[]

**Defined in**

[Plant.ts:164](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L164)

---

### logEntryLatest

• `get` **logEntryLatest**(): `undefined` \| [`LogEntry`](LogEntry.md)

**Returns**

`undefined` \| [`LogEntry`](LogEntry.md)

**Defined in**

[Plant.ts:171](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L171)

---

### logEntryOldest

• `get` **logEntryOldest**(): `undefined` \| [`LogEntry`](LogEntry.md)

**Returns**

`undefined` \| [`LogEntry`](LogEntry.md)

**Defined in**

[Plant.ts:168](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L168)

---

### name

• `get` **name**(): `undefined` \| `string`

**Returns**

`undefined` \| `string`

**Defined in**

[Plant.ts:116](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L116)

---

### notes

• `get` **notes**(): `string`

**Returns**

`string`

**Defined in**

[Plant.ts:156](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L156)

---

### onSaucer

• `get` **onSaucer**(): `undefined` \| `boolean`

**Returns**

`undefined` \| `boolean`

**Defined in**

[Plant.ts:136](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L136)

---

### phIdeal

• `get` **phIdeal**(): `undefined` \| `number`

**Returns**

`undefined` \| `number`

**Defined in**

[Plant.ts:144](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L144)

---

### potColor

• `get` **potColor**(): `undefined` \| `string`

**Returns**

`undefined` \| `string`

**Defined in**

[Plant.ts:132](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L132)

---

### potShapeTop

• `get` **potShapeTop**(): `undefined` \| `string`

**Returns**

`undefined` \| `string`

**Defined in**

[Plant.ts:128](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L128)

---

### substrate

• `get` **substrate**(): `undefined` \| `string`

**Returns**

`undefined` \| `string`

**Defined in**

[Plant.ts:124](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L124)

---

### tempIdeal

• `get` **tempIdeal**(): `undefined` \| `number`

**Returns**

`undefined` \| `number`

**Defined in**

[Plant.ts:152](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L152)

## Methods

### identify

▸ **identify**(): `string`

**Returns**

`string`

**Defined in**

[Plant.ts:179](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L179)

---

### toJSON

▸ **toJSON**(): [`PlantSerialized`](../modules.md#plantserialized)

Pre-serialize the `Plant` into an object ready to be turned into a JSON string.

**Returns**

[`PlantSerialized`](../modules.md#plantserialized)

The `Plant` as JSON-serializable object.

**Defined in**

[Plant.ts:274](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L274)

---

### toJSObject

▸ **toJSObject**(): [`PlantSerialized`](../modules.md#plantserialized)

**Returns**

[`PlantSerialized`](../modules.md#plantserialized)

**Defined in**

[Plant.ts:253](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L253)

---

### toString

▸ **toString**(): `string`

**Returns**

`string`

**Defined in**

[Plant.ts:183](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L183)

---

### Empty

▸ `Static` **Empty**(): [`Plant`](Plant.md)

**Returns**

[`Plant`](Plant.md)

**Defined in**

[Plant.ts:187](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L187)

---

### fromCSV

▸ `Static` **fromCSV**(`dataRow`, `log?`): [`Plant`](Plant.md)

**Parameters**

| Name      | Type                        |
| :-------- | :-------------------------- |
| `dataRow` | `string`[]                  |
| `log`     | [`LogEntry`](LogEntry.md)[] |

**Returns**

[`Plant`](Plant.md)

**Defined in**

[Plant.ts:207](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L207)

---

### fromJSON

▸ `Static` **fromJSON**(`dataString`): [`Plant`](Plant.md)

Parse a JSON string and construct a new `Plant` from it.

**Parameters**

| Name         | Type     | Description                |
| :----------- | :------- | :------------------------- |
| `dataString` | `string` | The JSON-serialized plant. |

**Returns**

[`Plant`](Plant.md)

The new `Plant`.

**Defined in**

[Plant.ts:248](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L248)

---

### fromJSObject

▸ `Static` **fromJSObject**(`dataObject`, `log?`): [`Plant`](Plant.md)

**Parameters**

| Name         | Type                                               |
| :----------- | :------------------------------------------------- |
| `dataObject` | [`PlantSerialized`](../modules.md#plantserialized) |
| `log`        | [`LogEntry`](LogEntry.md)[]                        |

**Returns**

[`Plant`](Plant.md)

**Defined in**

[Plant.ts:225](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L225)

---

### fromPlant

▸ `Static` **fromPlant**(`other`): [`Plant`](Plant.md)

**Parameters**

| Name    | Type                |
| :------ | :------------------ |
| `other` | [`Plant`](Plant.md) |

**Returns**

[`Plant`](Plant.md)

**Defined in**

[Plant.ts:191](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/Plant.ts#L191)
