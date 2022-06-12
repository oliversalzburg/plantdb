[@plantdb/libplantdb](../README.md) / [Exports](../modules.md) / LogEntry

# Class: LogEntry

A single entry in a PlantDB log.

## Accessors

### ec

• `get` **ec**(): `undefined` \| `number`

The EC value that was recorded with the event.

**Returns**

`undefined` \| `number`

**Defined in**

[LogEntry.ts:108](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L108)

---

### note

• `get` **note**(): `undefined` \| `string`

The note that the user recorded with the event.

**Returns**

`undefined` \| `string`

**Defined in**

[LogEntry.ts:101](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L101)

---

### ph

• `get` **ph**(): `undefined` \| `number`

The pH value that was recorded with the event.

**Returns**

`undefined` \| `number`

**Defined in**

[LogEntry.ts:115](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L115)

---

### plant

• `get` **plant**(): [`Plant`](Plant.md)

The plant this record refers to.

**Returns**

[`Plant`](Plant.md)

**Defined in**

[LogEntry.ts:129](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L129)

---

### plantDb

• `get` **plantDb**(): [`PlantDB`](PlantDB.md)

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[LogEntry.ts:66](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L66)

---

### plantId

• `get` **plantId**(): `string`

The ID of the plant. Expected to be in the format `PID-number`.

**Returns**

`string`

**Defined in**

[LogEntry.ts:80](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L80)

---

### plants

• `get` **plants**(): `ReadonlyMap`<`string`, [`Plant`](Plant.md)\>

**Returns**

`ReadonlyMap`<`string`, [`Plant`](Plant.md)\>

**Defined in**

[LogEntry.ts:141](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L141)

---

### productUsed

• `get` **productUsed**(): `undefined` \| `string`

The product that was used on the plant in this event.

**Returns**

`undefined` \| `string`

**Defined in**

[LogEntry.ts:122](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L122)

---

### sourceLine

• `get` **sourceLine**(): `number`

If this log entry was read from a file, this indicates the line in the file it originates from.

**Returns**

`number`

**Defined in**

[LogEntry.ts:73](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L73)

---

### timestamp

• `get` **timestamp**(): `Date`

The date/time the entry was recorded at.

**Returns**

`Date`

**Defined in**

[LogEntry.ts:87](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L87)

---

### type

• `get` **type**(): `string`

The type of the event, as it appears in the original user data.

**Returns**

`string`

**Defined in**

[LogEntry.ts:94](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L94)

## Methods

### toCSVData

▸ **toCSVData**(`databaseFormat`): (`undefined` \| `string` \| `number`)[]

**Parameters**

| Name             | Type                                  |
| :--------------- | :------------------------------------ |
| `databaseFormat` | [`DatabaseFormat`](DatabaseFormat.md) |

**Returns**

(`undefined` \| `string` \| `number`)[]

**Defined in**

[LogEntry.ts:208](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L208)

---

### toJSON

▸ **toJSON**(): [`LogEntrySerialized`](../modules.md#logentryserialized)

Pre-serialize the `LogEntry` into an object ready to be turned into a JSON string.

**Returns**

[`LogEntrySerialized`](../modules.md#logentryserialized)

The `LogEntry` as JSON-serializable object.

**Defined in**

[LogEntry.ts:267](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L267)

---

### toJSObject

▸ **toJSObject**(): [`LogEntrySerialized`](../modules.md#logentryserialized)

**Returns**

[`LogEntrySerialized`](../modules.md#logentryserialized)

**Defined in**

[LogEntry.ts:249](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L249)

---

### fromCSVData

▸ `Static` **fromCSVData**(`plantDb`, `dataRow`, `format`, `sourceFileLineNumber`): [`LogEntry`](LogEntry.md)

**Parameters**

| Name                   | Type                                  |
| :--------------------- | :------------------------------------ |
| `plantDb`              | [`PlantDB`](PlantDB.md)               |
| `dataRow`              | `string`[]                            |
| `format`               | [`DatabaseFormat`](DatabaseFormat.md) |
| `sourceFileLineNumber` | `number`                              |

**Returns**

[`LogEntry`](LogEntry.md)

**Defined in**

[LogEntry.ts:183](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L183)

---

### fromJSON

▸ `Static` **fromJSON**(`plantDb`, `dataString`): [`LogEntry`](LogEntry.md)

Parse a JSON string and construct a new `LogEntry` from it.

**Parameters**

| Name         | Type                    | Description                               |
| :----------- | :---------------------- | :---------------------------------------- |
| `plantDb`    | [`PlantDB`](PlantDB.md) | The `PlantDB` this `LogEntry` belongs to. |
| `dataString` | `string`                | The JSON-serialized log entry.            |

**Returns**

[`LogEntry`](LogEntry.md)

The new `LogEntry`.

**Defined in**

[LogEntry.ts:244](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L244)

---

### fromJSObject

▸ `Static` **fromJSObject**(`plantDb`, `dataObject`): [`LogEntry`](LogEntry.md)

**Parameters**

| Name         | Type                                                     |
| :----------- | :------------------------------------------------------- |
| `plantDb`    | [`PlantDB`](PlantDB.md)                                  |
| `dataObject` | [`LogEntrySerialized`](../modules.md#logentryserialized) |

**Returns**

[`LogEntry`](LogEntry.md)

**Defined in**

[LogEntry.ts:221](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L221)

---

### fromLogEntry

▸ `Static` **fromLogEntry**(`other`, `initializer?`): [`LogEntry`](LogEntry.md)

**Parameters**

| Name           | Type                                  |
| :------------- | :------------------------------------ |
| `other`        | [`LogEntry`](LogEntry.md)             |
| `initializer?` | `Partial`<[`LogEntry`](LogEntry.md)\> |

**Returns**

[`LogEntry`](LogEntry.md)

**Defined in**

[LogEntry.ts:168](https://github.com/oliversalzburg/plantdb/blob/620cdd7/packages/libplantdb/source/LogEntry.ts#L168)
