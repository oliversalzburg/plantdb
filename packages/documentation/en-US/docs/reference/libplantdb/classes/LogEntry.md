[@plantdb/libplantdb](../README.md) / [Exports](../modules.md) / LogEntry

# Class: LogEntry

A single entry in a PlantDB log.

## Constructors

### constructor

• **new LogEntry**(`plantId`, `timestamp?`, `type?`)

Constructs a new `LogEntry`.

**Parameters**

| Name        | Type     | Default value            | Description                           |
| :---------- | :------- | :----------------------- | :------------------------------------ |
| `plantId`   | `string` | `undefined`              | The ID of the plant.                  |
| `timestamp` | `Date`   | `undefined`              | The date/time the event was recorded. |
| `type`      | `string` | `EventTypes.Observation` | The type of event.                    |

**Defined in**

[LogEntry.ts:128](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L128)

## Accessors

### ec

• `get` **ec**(): `undefined` \| `number`

The EC value that was recorded with the event.

**Returns**

`undefined` \| `number`

**Defined in**

[LogEntry.ts:95](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L95)

---

### indexableText

• `get` **indexableText**(): `string`

An easily indexable string that represents the most relevant bits of text associated with the record.

**Returns**

`string`

**Defined in**

[LogEntry.ts:116](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L116)

---

### note

• `get` **note**(): `undefined` \| `string`

The note that the user recorded with the event.

**Returns**

`undefined` \| `string`

**Defined in**

[LogEntry.ts:88](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L88)

---

### ph

• `get` **ph**(): `undefined` \| `number`

The pH value that was recorded with the event.

**Returns**

`undefined` \| `number`

**Defined in**

[LogEntry.ts:102](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L102)

---

### plantId

• `get` **plantId**(): `string`

The ID of the plant. Expected to be in the format `PID-number`.

**Returns**

`string`

**Defined in**

[LogEntry.ts:67](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L67)

---

### productUsed

• `get` **productUsed**(): `undefined` \| `string`

The product that was used on the plant in this event.

**Returns**

`undefined` \| `string`

**Defined in**

[LogEntry.ts:109](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L109)

---

### sourceLine

• `get` **sourceLine**(): `undefined` \| `number`

If this log entry was read from a file, this indicates the line in the file it originates from.

**Returns**

`undefined` \| `number`

**Defined in**

[LogEntry.ts:60](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L60)

---

### timestamp

• `get` **timestamp**(): `Date`

The date/time the entry was recorded at.

**Returns**

`Date`

**Defined in**

[LogEntry.ts:74](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L74)

---

### type

• `get` **type**(): `string`

The type of the event, as it appears in the original user data.

**Returns**

`string`

**Defined in**

[LogEntry.ts:81](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L81)

## Methods

### toJSON

▸ **toJSON**(): [`LogEntrySerialized`](../modules.md#logentryserialized)

Pre-serialize the `LogEntry` into an object ready to be turned into a JSON string.

**Returns**

[`LogEntrySerialized`](../modules.md#logentryserialized)

The `LogEntry` as JSON-serializable object.

**Defined in**

[LogEntry.ts:231](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L231)

---

### toJSObject

▸ **toJSObject**(): [`LogEntrySerialized`](../modules.md#logentryserialized)

**Returns**

[`LogEntrySerialized`](../modules.md#logentryserialized)

**Defined in**

[LogEntry.ts:215](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L215)

---

### fromCSVData

▸ `Static` **fromCSVData**(`dataRow`, `format`, `sourceFileLineNumber?`): [`LogEntry`](LogEntry.md)

**Parameters**

| Name                    | Type                                  |
| :---------------------- | :------------------------------------ |
| `dataRow`               | `string`[]                            |
| `format`                | [`DatabaseFormat`](DatabaseFormat.md) |
| `sourceFileLineNumber?` | `number`                              |

**Returns**

[`LogEntry`](LogEntry.md)

**Defined in**

[LogEntry.ts:147](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L147)

---

### fromJSON

▸ `Static` **fromJSON**(`dataString`): [`LogEntry`](LogEntry.md)

Parse a JSON string and construct a new `LogEntry` from it.

**Parameters**

| Name         | Type     | Description                    |
| :----------- | :------- | :----------------------------- |
| `dataString` | `string` | The JSON-serialized log entry. |

**Returns**

[`LogEntry`](LogEntry.md)

The new `LogEntry`.

**Defined in**

[LogEntry.ts:210](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L210)

---

### fromJSObject

▸ `Static` **fromJSObject**(`dataObject`): [`LogEntry`](LogEntry.md)

**Parameters**

| Name         | Type                                                     |
| :----------- | :------------------------------------------------------- |
| `dataObject` | [`LogEntrySerialized`](../modules.md#logentryserialized) |

**Returns**

[`LogEntry`](LogEntry.md)

**Defined in**

[LogEntry.ts:192](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L192)

---

### fromLogEntry

▸ `Static` **fromLogEntry**(`other`): [`LogEntry`](LogEntry.md)

**Parameters**

| Name    | Type                      |
| :------ | :------------------------ |
| `other` | [`LogEntry`](LogEntry.md) |

**Returns**

[`LogEntry`](LogEntry.md)

**Defined in**

[LogEntry.ts:138](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L138)

---

### tryParseEC

▸ `Static` **tryParseEC**(`dataValue`): `undefined` \| `number`

**Parameters**

| Name        | Type     |
| :---------- | :------- |
| `dataValue` | `string` |

**Returns**

`undefined` \| `number`

**Defined in**

[LogEntry.ts:166](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L166)

---

### tryParsePh

▸ `Static` **tryParsePh**(`dataValue`): `undefined` \| `number`

**Parameters**

| Name        | Type     |
| :---------- | :------- |
| `dataValue` | `string` |

**Returns**

`undefined` \| `number`

**Defined in**

[LogEntry.ts:179](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/LogEntry.ts#L179)
