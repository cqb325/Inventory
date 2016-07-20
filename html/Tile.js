
const React = require('react');
const Component = React.Component;

class Tile extends Component {
    render() {
        return React.createElement(
            "div",
            { className: "tile" },
            React.createElement(
                "div",
                { className: "tile-header" },
                this.props.header
            ),
            React.createElement(
                "div",
                { className: "tile-content" },
                this.props.children
            )
        );
    }
}

module.exports = Tile;
