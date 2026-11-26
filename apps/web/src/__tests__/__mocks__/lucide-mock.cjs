const React = require('react');

const Icon = (props) => React.createElement('svg', { 'aria-hidden': 'true', 'data-testid': 'icon', ...props });

module.exports = new Proxy(
  {},
  {
    get: () => Icon,
  },
);
