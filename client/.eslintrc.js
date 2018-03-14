module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "plugin:css-modules/recommended",
    "google",
  ],
  "rules": {
    "switch-colon-spacing": 0,
    "object-curly-spacing" : [
      "error", "always", {
        "arraysInObjects": false
      }
    ],
    "key-spacing": [
      "error", {
        "singleLine": {
          "beforeColon": false,
          "afterColon": false
        },
        "multiLine": {
          "beforeColon": false,
          "afterColon": true
        }
      }
    ],
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "brace-style": [ "error", "1tbs", { "allowSingleLine": true }],
    "block-spacing": [ "error", "always"]
  },
  "plugins": [
    "react",
    "css-modules"
  ]
};
