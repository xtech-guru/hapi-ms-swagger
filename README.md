# Hapi MS

Boilerplate for a Hapi based micro service.

## Install

```shell
npm install
```

## Start

```shell
npm start
```

## Test

```shell
npm test
```

## Configuration

Configuration is done through environment variables. For example:

```shell
HOST="localhost" PORT="3000" DB_URL="mongodb://localhost/hapi-ms" npm start
```

See `config.js` for a full list of supported environment variables and default values.

## Presets and utilities

### Mongoose

#### Timestamps

Timestamps are enabled by default on all schemas. To disable them for a specific schema, set the schema's `timestamps`
option to `false`.

#### Normalized paths

For case-insensitive sorting, properties should be saved in a normalized format. This is done by adding corresponding
paths of the properties that should be normalized to the `normalized` sub-document. The values of these fields will be
automatically saved in the `normalized` sub-document in lower case format during save.

Example:

```js
const MySchema = new mongoose.Schema({
  name: {type: String, trim: true, required: true, unique: true},
  normalized: {
    name: String
  }
});
```

#### Unique validation

A validator for paths declared as unique is added to all schemas. By default the comparison is case-insensitive, but
this can be configured on a schema basis through the path option `uniqueOptions`.

Example:

```js
const MySchema = new mongoose.Schema({
  name: {type: String, unique: true, uniqueOptions: {ci: false}}
});
```

These validation errors have the `type` property set to `unique`.

#### Properties stripped from replies

By default some properties are stripped out from replies through a custom `toJSON` option that is configured for all
schemas. See `init/mongoose.js` for details.

### Joi

The module `/lib/joi.js` exports a 'Joi' object extended with custom validators.

#### MongoId validator

A MongoId validator has been added to Joi. It can be used as follows:

```js
Joi.object({
  id: Joi.string().objectId()
});
```

### Responses

#### Validation errors

Joi and Mongoose validation errors are transformed to the following format and returned with the HTTP code `400`:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "ValidationError",
  "errors":{
    "path":{
      "type": "<error type>",
      "value": "<path value>"
    },
    "path.subPath":{
      "type": "<error type>",
      "value": "<path value>",
      "<error specific property>": "<property value>"
    }
  }
}
```

The `errors` property is an object whose keys are the paths, in dot-notation, of the properties for which validation
failed. The values are objects with the following properties:

* `type`: the error type as returned by the validator (Joi's `type` and Mongoose's `kind` properties)
* `value`: the value of the property
* other error specific properties, e.g. `"limit": 5` for Joi validators with a `limit` value (e.g. `string.min`)

## Modules

By default, on application initialization, all directories under `modules` and their sub-directories are scanned for
files named `index.js`, and if found, these files are loaded with `require`. If a loaded module contains a function
called `register`, it is also registered on the server as a plugin.

The direct sub-directories of a module are treated as versions, and only index files in enabled versions are loaded.
By default, only the version `v1` is enabled, but the list of enabled versions can be configured through the
configuration option `versions`, e.g. `versions: ['v1', 'v2', 'whatever']`.

When a module is registered as a plugin, its routes are prefixed with `/{version}/{subdir 1}/.../{subdir n}/{module}`.

### Example

Following is a sample directory structure of a module `things`:

```
+--- modules
     +--- things
          |--- index.js              // always loaded, routes prefix: '/things'
          +--- v1
          |    |--- index.js         // loaded if 'versions' contains 'v1', routes prefix: '/v1/things'
          |    +--- admin
          |         |--- index.js    // loaded if 'versions' contains 'v1', routes prefix: '/v1/admin/things'
          +--- v2
               |--- index.js         // loaded if 'versions' contains 'v2', routes prefix: '/v2/things'
               +--- admin
                    |--- index.js    // loaded if 'versions' contains 'v2', routes prefix: '/v2/admin/things'
```
