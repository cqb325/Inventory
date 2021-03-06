/**
 * @author cqb 2016-04-05.
 * @module Button
 */

const React = require("react");
const classnames = require("./classnames");
const BaseComponent = require("./core/BaseComponent");
const FontIcon = require('./FontIcon');
const EnhancedButton = require('./internal/EnhancedButton');

/**
 * Button 类
 * @class Button
 * @constructor
 * @extend BaseComponent
 */
class Button extends BaseComponent {
    constructor(props) {
        super(props);

        this.addState({
            disabled: props.disabled,
            raised: false,
            text: null
        });
    }

    /**
     * 禁用
     * @method disable
     * @param elem {Element} 显示的内容
     */
    disable(elem) {
        this.setState({ disabled: true, show: elem });
    }

    /**
     * 启用
     * @method enable
     * @param elem {Element} 显示的内容
     */
    enable(elem) {
        this.setState({ disabled: false, show: elem });
    }

    /**
     * 点击回调
     * @private
     * @method _handleClick
     */
    _handleClick(e) {
        if (this.state.disabled) {
            return;
        }
        if (this.props.onClick) {
            this.props.onClick();
        }
        this.emit("click");
        if (this.props.once) {
            this.disable();
        }
    }

    handleMouseDown() {
        if (event.button === 0 && !this.props.disabled) {
            this.setState({
                raised: true
            });
        }
    }

    handleMouseUp() {
        if (!this.props.disabled) {
            this.setState({
                raised: false
            });
        }
    }

    /**
     * 渲染
     */
    render() {
        const className = classnames(this.props.className, 'cm-button', this.state.theme, {
            "cm-iconButton": this.props.iconButton,
            raised: this.props.raised && this.state.raised,
            flat: this.props.flat
        });

        let link = this.props.href || "javascript:void(0)";

        let props = this.props;
        let iconPosition = this.props.iconAlign || "left";
        let icon = this.props.icon ? React.createElement(FontIcon, { icon: this.props.icon, className: iconPosition }) : null;

        let nodes = iconPosition === "left" ? React.createElement(
            EnhancedButton,
            null,
            icon,
            props.children
        ) : React.createElement(
            EnhancedButton,
            null,
            props.children,
            icon
        );

        return React.createElement(
            "a",
            { href: link, ref: "button",
                disabled: this.state.disabled,
                onClick: this._handleClick.bind(this),
                onMouseUp: this.handleMouseUp.bind(this),
                onMouseDown: this.handleMouseDown.bind(this),
                className: className,
                style: this.props.style,
                target: this.props.target },
            nodes
        );
    }
}

module.exports = Button;
