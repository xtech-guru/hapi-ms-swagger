# IMPORTANT

The project is being refactored into a plugin with support for Swagger. You can follow progress on the `feature/plugin`
branch. 

# Hapi MS Swagger

Hapi plugin for easy bootstrapping of a Swagger based web API. 

## Install

```shell
npm install --save @xtech-pub/hapi-ms-swagger
```

## Bootstrapping

```js
server.register({
  register: require('@xtech-pub/hapi-ms-swagger'),
  options: options
});
```

## Options

The options object contains options for the different plugins loaded by 'hapi-ms-swagger', which are:
 
* `log`: logging through 'good'
* `db`: database through 'Mongoose'
* `pagination`: handles pagination parameters in requests
* `swaggerize`: swagger integration through 'swaggerize-hapi'
* `rbac`: RBAC through '@xtech-pub/hapi-swagger-rbac'
* `dql`: MongoDQL integration

The dependencies on the required packages for every plugin must be added to the application's `package.json`. Plugins
can also be disabled by setting their options to `false`, e.g. `{log: false}` to disable loading the logging plugin.

More details about the different plugins, the functionality they offer, the packages they depend on and their options
can be found in the section 'Plugins'.

## Plugins

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

## Responses

### Validation errors

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
