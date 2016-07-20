/**
 * @author cqb 2016-05-01.
 * @module Upload
 */

const React = require("react");
const ReactDOM = require('react-dom');
const PropTypes = React.PropTypes;
const classnames = require("./classnames");
const BaseComponent = require("./core/BaseComponent");
const Core = require('./Core');
const Dom = require('./utils/Dom');

/**
 * Toast 类
 * @class Toast
 * @constructor
 * @extend BaseComponent
 */
class Toast extends BaseComponent {
    constructor(props) {
        super(props);

        this.addState({
            visibility: false
        });
    }

    show() {
        this.setState({
            visibility: true
        });
    }

    hide() {
        this.setState({
            visibility: false
        });
    }

    componentDidMount() {
        if (!window.Toast) {
            window.Toast = this;
        } else {
            console.warn("Toast already exist");
        }
    }

    render() {
        return React.createElement(
            "div",
            { className: "weui_loading_toast", style: { display: this.state.visibility ? "block" : "none" } },
            React.createElement("div", { className: "weui_mask_transparent" }),
            React.createElement(
                "div",
                { className: "weui_toast" },
                React.createElement(
                    "div",
                    { className: "weui_loading" },
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_0" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_1" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_2" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_3" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_4" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_5" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_6" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_7" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_8" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_9" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_10" }),
                    React.createElement("div", { className: "weui_loading_leaf weui_loading_leaf_11" })
                ),
                React.createElement(
                    "p",
                    { className: "weui_toast_content" },
                    "数据加载中"
                )
            )
        );
    }
}

Toast.propTypes = {
    /**
     * 自定义class
     * @attribute className
     * @type {String}
     */
    className: PropTypes.string,
    /**
     * 自定义样式
     * @attribute style
     * @type {Object}
     */
    style: PropTypes.object
};

module.exports = Toast;
