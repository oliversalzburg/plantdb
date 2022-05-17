[@plantdb/libplantdb](../README.md) / [Exports](../modules.md) / PlantDB

# Class: PlantDB

## Constructors

### constructor

• **new PlantDB**()

## Accessors

### config

• `get` **config**(): [`DatabaseFormat`](DatabaseFormat.md)

**Returns**

[`DatabaseFormat`](DatabaseFormat.md)

**Defined in**

[PlantDB.ts:12](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantDB.ts#L12)

---

### entryTypes

• `get` **entryTypes**(): `ReadonlySet`<`string`\>

**Returns**

`ReadonlySet`<`string`\>

**Defined in**

[PlantDB.ts:24](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantDB.ts#L24)

---

### log

• `get` **log**(): readonly [`LogEntry`](LogEntry.md)[]

**Returns**

readonly [`LogEntry`](LogEntry.md)[]

**Defined in**

[PlantDB.ts:20](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantDB.ts#L20)

---

### plants

• `get` **plants**(): `ReadonlyMap`<`string`, [`Plant`](Plant.md)\>

**Returns**

`ReadonlyMap`<`string`, [`Plant`](Plant.md)\>

**Defined in**

[PlantDB.ts:16](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantDB.ts#L16)

## Methods

### withNewLog

▸ **withNewLog**(`log`): [`PlantDB`](PlantDB.md)

**Parameters**

| Name  | Type                                 |
| :---- | :----------------------------------- |
| `log` | readonly [`LogEntry`](LogEntry.md)[] |

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:32](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantDB.ts#L32)

---

### Empty

▸ `Static` **Empty**(): [`PlantDB`](PlantDB.md)

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:28](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantDB.ts#L28)

---

### fromCSV

▸ `Static` **fromCSV**(`databaseFormat`, `plantDataRaw`, `plantLogDataRaw`): [`PlantDB`](PlantDB.md)

**Parameters**

| Name              | Type                                  |
| :---------------- | :------------------------------------ |
| `databaseFormat`  | [`DatabaseFormat`](DatabaseFormat.md) |
| `plantDataRaw`    | `string`                              |
| `plantLogDataRaw` | `string`                              |

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:55](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantDB.ts#L55)

---

### fromJSObjects

▸ `Static` **fromJSObjects**(`databaseFormat`, `plants`, `plantLogData`): [`PlantDB`](PlantDB.md)

**Parameters**

| Name             | Type                                                       |
| :--------------- | :--------------------------------------------------------- |
| `databaseFormat` | [`DatabaseFormat`](DatabaseFormat.md)                      |
| `plants`         | [`PlantSerialized`](../modules.md#plantserialized)[]       |
| `plantLogData`   | [`LogEntrySerialized`](../modules.md#logentryserialized)[] |

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:93](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantDB.ts#L93)

---

### fromPlantDB

▸ `Static` **fromPlantDB**(`other`, `initializer?`): [`PlantDB`](PlantDB.md)

**Parameters**

| Name           | Type                                |
| :------------- | :---------------------------------- |
| `other`        | [`PlantDB`](PlantDB.md)             |
| `initializer?` | `Partial`<[`PlantDB`](PlantDB.md)\> |

**Returns**

[`PlantDB`](PlantDB.md)

**Defined in**

[PlantDB.ts:36](https://github.com/oliversalzburg/plantdb/blob/a9cd216/packages/libplantdb/source/PlantDB.ts#L36)
