# init-package-json-parcel

A command line tool which is wrapper of `npm init`.

- When has not git remote url, automatically create `repository.url`
    - `https://github.com/:git-user-name/:package-name`

## Use case

I have not published my development module to GitHub yet,
but I want to create `package.json` which has `repository` field.

Because `repository` url of `package.json` is `"https://github.com/<user-name>/<directory-name>.git"` in in most cases.

## Installation

```
npm install -g init-package-json-parcel
```

## Usage

```
init-package-json
```

≒ `npm init`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT