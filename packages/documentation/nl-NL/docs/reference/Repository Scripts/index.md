# Full reference

## clean

-   Project: `plantdb`
-   Source:

    ```shell
    yarn workspaces foreach run clean
    ```

-   Description:

    _documentation pending_

## cli:run

-   Project: `@plantdb/plant-cli`
-   Source:

    ```shell
    yarn build && node output/main.cjs --cwd="$INIT_CWD"
    ```

-   Description:

    _documentation pending_

## docs:build

-   Project: `documentation`
-   Source:

    ```shell
    .scripts/build.sh
    ```

-   Description:

    _documentation pending_

## docs:scripts:build

-   Project: `plantdb`
-   Source:

    ```shell
    nsd --docs-location "packages/documentation/en-US/docs/reference/Repository Scripts/"
    ```

-   Description:

    _documentation pending_

## docs:scripts:check

-   Project: `plantdb`
-   Source:

    ```shell
    nsd --docs-location "packages/documentation/en-US/docs/reference/Repository Scripts/" --check-only
    ```

-   Description:

    _documentation pending_

## docs:serve

-   Project: `documentation`
-   Source:

    ```shell
    .scripts/serve.sh
    ```

-   Description:

    _documentation pending_

## lint:eslint

-   Project: `plantdb`
-   Source:

    ```shell
    eslint packages/*/source
    ```

-   Description:

    _documentation pending_

## lint:tsc

-   Project: `plantdb`
-   Source:

    ```shell
    tsc --noEmit
    ```

-   Description:

    _documentation pending_
