[@plantdb/libplantdb](README.md) / Exports

# @plantdb/libplantdb

## Classes

-   [DatabaseFormat](classes/DatabaseFormat.md)
-   [LogEntry](classes/LogEntry.md)
-   [Plant](classes/Plant.md)
-   [PlantDB](classes/PlantDB.md)

## Type Aliases

### DatabaseFormatSerialized

Ƭ **DatabaseFormatSerialized**: `Object`

Describes a plain JS object, containing all the properties required to initialize
a `DatabaseFormat`.

#### Type declaration

| Name               | Type                                                     |
| :----------------- | :------------------------------------------------------- |
| `columnSeparator`  | `string`                                                 |
| `dateFormat`       | `string`                                                 |
| `decimalSeparator` | `string`                                                 |
| `hasHeaderRow`     | `boolean`                                                |
| `timezone`         | `string`                                                 |
| `typeMap`          | `Record`<`string`, [`EventType`](modules.md#eventtype)\> |

**Defined in**

[DatabaseFormat.ts:75](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/DatabaseFormat.ts#L75)

---

### EventType

Ƭ **EventType**: keyof typeof [`EventTypes`](modules.md#eventtypes)

All possible values for internally known event types.

**Defined in**

[DatabaseFormat.ts:69](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/DatabaseFormat.ts#L69)

---

### LogEntrySerialized

Ƭ **LogEntrySerialized**: `Object`

Describes an object containing all the fields required to initialize a `LogEntry`.

#### Type declaration

| Name           | Type     | Description                                                    |
| :------------- | :------- | :------------------------------------------------------------- |
| `ec?`          | `number` | The EC value recorded with the entry, if any.                  |
| `note?`        | `string` | A note that was recorded with the event, if any.               |
| `ph?`          | `number` | The pH value recorded with the entry, if any.                  |
| `plantId`      | `string` | The ID of the plant.                                           |
| `productUsed?` | `string` | The product that was used during the event, if any.            |
| `sourceLine`   | `number` | The line in the original CSV input this entry originated from. |
| `timestamp`    | `string` | A string representation of a `Date`.                           |
| `type`         | `string` | The user-supplied type of this entry.                          |

**Defined in**

[LogEntry.ts:10](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/LogEntry.ts#L10)

---

### PlantSerialized

Ƭ **PlantSerialized**: `Object`

Describes an object containing all the fields required to initialize a `Plant`.

#### Type declaration

| Name           | Type                   | Description                                                                             |
| :------------- | :--------------------- | :-------------------------------------------------------------------------------------- |
| `ecMax?`       | `number`               | The maximum EC value for this plant.                                                    |
| `ecMin?`       | `number`               | The minium EC value for this plant.                                                     |
| `id`           | `string`               | The ID of the plant.                                                                    |
| `isArchived?`  | `boolean`              | Has this plant been archived? Archived plants are usually ignored in primary use cases. |
| `kind?`        | `string` \| `string`[] | The kind(s) of the plant.                                                               |
| `location?`    | `string` \| `string`[] | The current location of the plant.                                                      |
| `name?`        | `string`               | The name of the plant.                                                                  |
| `notes?`       | `string`               | Any notes about this plant.                                                             |
| `onSaucer?`    | `boolean`              | Does the plant current sit on a saucer?                                                 |
| `phMax?`       | `number`               | The maximum pH value for this plant.                                                    |
| `phMin?`       | `number`               | The minimum pH value for this plant.                                                    |
| `plantgeekId?` | `string` \| `string`[] | ID(s) of plant(s) on plantgeek.co that provide more information about this plant.       |
| `potColor?`    | `string`               | The color of the pot.                                                                   |
| `potShapeTop?` | `string`               | The shape of the pot, when viewed from above.                                           |
| `substrate?`   | `string` \| `string`[] | The current substrate(s) the plant is planted in.                                       |
| `tempMax?`     | `number`               | The maximum temperature for this plant.                                                 |
| `tempMin?`     | `number`               | The minimum temperature for this plant.                                                 |

**Defined in**

[Plant.ts:36](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Plant.ts#L36)

---

### PotColor

Ƭ **PotColor**: `"Black"` \| `"Brown"` \| `"Grey"` \| `"LightGrey"` \| `"Orange"` \| `"Transparent"` \| `"White"`

Internally understood pot colors.

**Defined in**

[Plant.ts:24](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Plant.ts#L24)

---

### PotShapeTop

Ƭ **PotShapeTop**: `"Oval"` \| `"Rectangle"` \| `"Round"` \| `"Square"`

Internally understood pot shapes.

**Defined in**

[Plant.ts:19](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Plant.ts#L19)

## Variables

### EventTypes

• `Const` **EventTypes**: `Object`

A hash of internally known event types to a human-readable, English version.

#### Type declaration

| Name              | Type                 | Description                                                                                                    |
| :---------------- | :------------------- | :------------------------------------------------------------------------------------------------------------- |
| `Acquisition`     | `"Acquisition"`      | Typically, this marks the first event of a plant, if that plant was acquired (purchased) from a vendor.        |
| `Fertilization`   | `"Fertilization"`    | A plant was fertilized.                                                                                        |
| `Measurement`     | `"Measurement"`      | A measurement has been taken from the plant.                                                                   |
| `Observation`     | `"Observation"`      | Something not further categorizable has been observed about the plant.                                         |
| `PestControl`     | `"Pest control"`     | A pest situation has been acted on.                                                                            |
| `PestInfestation` | `"Pest infestation"` | A pest situation has been identified.                                                                          |
| `Pruning`         | `"Pruning"`          | Branches have been pruned.                                                                                     |
| `Relocation`      | `"Relocation"`       | Plant was moved from one location to another one.                                                              |
| `Repotting`       | `"Repotting"`        | Plant was put into a (new) pot. Usually also marks the first event of a plant that was created from a cutting. |
| `RootPruning`     | `"Root pruning"`     | Roots have been pruned.                                                                                        |
| `Shaping`         | `"Shaping"`          | The plant was shaped. For example, through wiring branches. Not to be confused with Pruning.                   |
| `Watering`        | `"Watering"`         | Any form of irrigation                                                                                         |

**Defined in**

[DatabaseFormat.ts:4](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/DatabaseFormat.ts#L4)

---

### MATCH_PID

• `Const` **MATCH_PID**: `RegExp`

Matches a Plant ID.

**Defined in**

[Plant.ts:9](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Plant.ts#L9)

---

### MATCH_PID_ALL

• `Const` **MATCH_PID_ALL**: `RegExp`

Matches all Plant IDs.

**Defined in**

[Plant.ts:14](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Plant.ts#L14)

## Functions

### floatFromCSV

▸ **floatFromCSV**(`csvData`, `column`, `databaseFormat`): `undefined` \| `number`

Retrieve a float value from a specific column in CSV data.
If the column contains no readable value, it is treated as `undefined`.

**Parameters**

| Name             | Type                                          | Description                                                    |
| :--------------- | :-------------------------------------------- | :------------------------------------------------------------- |
| `csvData`        | readonly `string`[]                           | CSV data that has already been parsed into individual columns. |
| `column`         | `number`                                      | The index of the column to retrieve.                           |
| `databaseFormat` | [`DatabaseFormat`](classes/DatabaseFormat.md) | The `DatabaseFormat` to be used to interpret the data.         |

**Returns**

`undefined` \| `number`

The correctly parsed CSV value.

**Defined in**

[Tools.ts:141](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L141)

---

### identifyLogType

▸ **identifyLogType**(`entryType`, `plantDb`): `undefined` \| `"Acquisition"` \| `"Fertilization"` \| `"Measurement"` \| `"Observation"` \| `"Pruning"` \| `"Relocation"` \| `"Repotting"` \| `"Shaping"` \| `"Watering"` \| `"PestControl"` \| `"PestInfestation"` \| `"RootPruning"`

Identify a user-given event type to an internally-known one, based on the information found in a `PlantDB`.

**Parameters**

| Name        | Type                            | Description                                          |
| :---------- | :------------------------------ | :--------------------------------------------------- |
| `entryType` | `string`                        | A type of event as it's given in user-supplied data. |
| `plantDb`   | [`PlantDB`](classes/PlantDB.md) | The plant database that it is found in.              |

**Returns**

`undefined` \| `"Acquisition"` \| `"Fertilization"` \| `"Measurement"` \| `"Observation"` \| `"Pruning"` \| `"Relocation"` \| `"Repotting"` \| `"Shaping"` \| `"Watering"` \| `"PestControl"` \| `"PestInfestation"` \| `"RootPruning"`

The internally-known event type for the user-given event type.

**Defined in**

[Tools.ts:51](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L51)

---

### intFromCSV

▸ **intFromCSV**(`csvData`, `column`, `databaseFormat`): `undefined` \| `number`

Retrieve an integer value from a specific column in CSV data.
If the column contains no readable value, it is treated as `undefined`.

**Parameters**

| Name             | Type                                          | Description                                                    |
| :--------------- | :-------------------------------------------- | :------------------------------------------------------------- |
| `csvData`        | readonly `string`[]                           | CSV data that has already been parsed into individual columns. |
| `column`         | `number`                                      | The index of the column to retrieve.                           |
| `databaseFormat` | [`DatabaseFormat`](classes/DatabaseFormat.md) | The `DatabaseFormat` to be used to interpret the data.         |

**Returns**

`undefined` \| `number`

The correctly parsed CSV value.

**Defined in**

[Tools.ts:164](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L164)

---

### kindFlatten

▸ **kindFlatten**(`plantKind`): `string`

Add all the kinds of a plant into a single string.

**Parameters**

| Name        | Type                                  | Description            |
| :---------- | :------------------------------------ | :--------------------- |
| `plantKind` | `undefined` \| `string` \| `string`[] | A `kind` if a `Plant`. |

**Returns**

`string`

A string that contains all the kinds the plant.

**Defined in**

[Tools.ts:32](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L32)

---

### kindSummarize

▸ **kindSummarize**(`plantKind`): `string`

Summarize the kinds in a plant.

**Parameters**

| Name        | Type                                  | Description           |
| :---------- | :------------------------------------ | :-------------------- |
| `plantKind` | `undefined` \| `string` \| `string`[] | A `kind` of a `Plant` |

**Returns**

`string`

A string that summarizes the kinds in a plant.

**Defined in**

[Tools.ts:14](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L14)

---

### logFromCSV

▸ **logFromCSV**(`plantDb`, `logCSV`, `databaseFormat`): [`LogEntry`](classes/LogEntry.md)[]

**Parameters**

| Name             | Type                                          |
| :--------------- | :-------------------------------------------- |
| `plantDb`        | [`PlantDB`](classes/PlantDB.md)               |
| `logCSV`         | `string`                                      |
| `databaseFormat` | [`DatabaseFormat`](classes/DatabaseFormat.md) |

**Returns**

[`LogEntry`](classes/LogEntry.md)[]

**Defined in**

[Tools.ts:78](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L78)

---

### logToCSV

▸ **logToCSV**(`log`, `databaseFormat`): `string`

**Parameters**

| Name             | Type                                          |
| :--------------- | :-------------------------------------------- |
| `log`            | [`LogEntry`](classes/LogEntry.md)[]           |
| `databaseFormat` | [`DatabaseFormat`](classes/DatabaseFormat.md) |

**Returns**

`string`

**Defined in**

[Tools.ts:71](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L71)

---

### makePlantMap

▸ **makePlantMap**(`plants`): `Map`<`string`, [`Plant`](classes/Plant.md)\>

Turn an array of plants into a map that maps their IDs to the respective plant.

**Parameters**

| Name     | Type                                   | Description                      |
| :------- | :------------------------------------- | :------------------------------- |
| `plants` | readonly [`Plant`](classes/Plant.md)[] | The plants to turn into a `Map`. |

**Returns**

`Map`<`string`, [`Plant`](classes/Plant.md)\>

A `Map` that maps plant IDs to their respective plant.

**Defined in**

[Tools.ts:208](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L208)

---

### plantsFromCSV

▸ **plantsFromCSV**(`plantDb`, `plantCSV`, `databaseFormat`): [`Plant`](classes/Plant.md)[]

**Parameters**

| Name             | Type                                          |
| :--------------- | :-------------------------------------------- |
| `plantDb`        | [`PlantDB`](classes/PlantDB.md)               |
| `plantCSV`       | `string`                                      |
| `databaseFormat` | [`DatabaseFormat`](classes/DatabaseFormat.md) |

**Returns**

[`Plant`](classes/Plant.md)[]

**Defined in**

[Tools.ts:96](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L96)

---

### plantsToCSV

▸ **plantsToCSV**(`plants`, `databaseFormat`): `string`

**Parameters**

| Name             | Type                                          |
| :--------------- | :-------------------------------------------- |
| `plants`         | [`Plant`](classes/Plant.md)[]                 |
| `databaseFormat` | [`DatabaseFormat`](classes/DatabaseFormat.md) |

**Returns**

`string`

**Defined in**

[Tools.ts:89](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L89)

---

### roundTo

▸ **roundTo**(`input`, `digits?`): `number`

Round a number to a given number of digits.

**Parameters**

| Name     | Type     | Default value | Description                       |
| :------- | :------- | :------------ | :-------------------------------- |
| `input`  | `number` | `undefined`   | A number to round.                |
| `digits` | `number` | `2`           | The amount of digits to round to. |

**Returns**

`number`

The input number rounded to the given number of digits.

**Defined in**

[Tools.ts:66](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L66)

---

### splitMultiValue

▸ **splitMultiValue**(`multiValue`): `string` \| `string`[]

Split the provided value into an array of strings, if it contains multiple lines of text.

**Parameters**

| Name         | Type     | Description                                             |
| :----------- | :------- | :------------------------------------------------------ |
| `multiValue` | `string` | A string that potentially holds multiple lines of text. |

**Returns**

`string` \| `string`[]

A single string if the column contained a single line. An array of strings of the column contained multiple lines.

**Defined in**

[Tools.ts:198](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L198)

---

### tryParseBool

▸ **tryParseBool**(`boolValue`): `undefined` \| `boolean`

**Parameters**

| Name        | Type     |
| :---------- | :------- |
| `boolValue` | `string` |

**Returns**

`undefined` \| `boolean`

**Defined in**

[Tools.ts:212](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L212)

---

### tryParseFloat

▸ **tryParseFloat**(`numberValue`, `databaseFormat?`): `undefined` \| `number`

**Parameters**

| Name             | Type                                          |
| :--------------- | :-------------------------------------------- |
| `numberValue`    | `string`                                      |
| `databaseFormat` | [`DatabaseFormat`](classes/DatabaseFormat.md) |

**Returns**

`undefined` \| `number`

**Defined in**

[Tools.ts:222](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L222)

---

### tryParseInt

▸ **tryParseInt**(`numberValue`, `databaseFormat?`): `undefined` \| `number`

**Parameters**

| Name             | Type                                          |
| :--------------- | :-------------------------------------------- |
| `numberValue`    | `string`                                      |
| `databaseFormat` | [`DatabaseFormat`](classes/DatabaseFormat.md) |

**Returns**

`undefined` \| `number`

**Defined in**

[Tools.ts:240](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L240)

---

### valueFromCSV

▸ **valueFromCSV**(`csvData`, `column`, `expectMultiValue?`): `undefined` \| `string` \| `string`[]

Retrieve the value from a specific column in CSV data.
If the column contains no readable value, it is treated as `undefined`.

**Parameters**

| Name               | Type                | Default value | Description                                                                                                       |
| :----------------- | :------------------ | :------------ | :---------------------------------------------------------------------------------------------------------------- |
| `csvData`          | readonly `string`[] | `undefined`   | CSV data that has already been parsed into individual columns.                                                    |
| `column`           | `number`            | `undefined`   | The index of the column to retrieve.                                                                              |
| `expectMultiValue` | `boolean`           | `true`        | Should multiple lines of strings be treated as individual values (true) or as a single multi-line string (false)? |

**Returns**

`undefined` \| `string` \| `string`[]

The correctly parsed CSV value.

**Defined in**

[Tools.ts:119](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L119)

---

### valueToCSV

▸ **valueToCSV**(`value?`): `string`

Turn a data value into a single string that we can serialize to CSV.

**Parameters**

| Name     | Type                   | Description                                 |
| :------- | :--------------------- | :------------------------------------------ |
| `value?` | `string` \| `string`[] | The value to prepare for CSV serialization. |

**Returns**

`string`

A single string containing all the provided values.

**Defined in**

[Tools.ts:184](https://github.com/oliversalzburg/plantdb/blob/1c284c0/packages/libplantdb/source/Tools.ts#L184)
