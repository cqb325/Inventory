const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;

const Tile = require('../Tile');
const Input = require('../lib/Input');
const Form = require('../lib/Form');
const FormControl = require('../lib/FormControl');
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const MessageBox = require('../lib/MessageBox');

const ProductService = require("../services/ProductService");

let Page = React.createClass({
    displayName: 'Page',


    submit() {
        let formItems = this.refs.form.getItems();
        let params = {
            prov_id: this.props.params.prov_id,
            prod_name: formItems["prod_name"].ref.getValue(),
            prod_price: formItems["prod_price"].ref.getValue(),
            prod_brand: formItems["prod_brand"].ref.getValue(),
            prod_type: formItems["prod_type"].ref.getValue(),
            prod_model: formItems["prod_model"].ref.getValue(),
            prod_specifications: formItems["prod_specifications"].ref.getValue()
        };

        ProductService.save(params, ret => {
            if (ret) {
                this.refs.tip.show("保存成功");
                this.refs.tip.setData(true);
            } else {
                this.refs.tip.show("保存失败");
                this.refs.tip.setData(false);
            }
        });
    },

    confirm() {
        if (this.refs.tip.getData()) {
            window.location.href = "#product_list/" + this.props.params.prov_id;
        }
    },

    render() {
        return React.createElement(
            'div',
            { className: 'main-container' },
            React.createElement(MessageBox, { title: '提示', ref: 'tip', confirm: this.confirm }),
            React.createElement(
                Label,
                { className: 'searchTools mt-30 mb-20', component: 'div' },
                React.createElement(
                    Label,
                    { grid: 0.3 },
                    React.createElement(
                        'h4',
                        null,
                        '新增产品'
                    )
                ),
                React.createElement(
                    Label,
                    { grid: 0.7, className: 'text-right' },
                    React.createElement(
                        Button,
                        { icon: 'mail-reply', theme: 'info', raised: true, href: 'javascript:history.go(-1)' },
                        '返 回'
                    )
                )
            ),
            React.createElement(
                Tile,
                { header: '产品信息' },
                React.createElement(
                    Form,
                    { ref: 'form', method: 'custom', layout: 'stack', submit: this.submit },
                    React.createElement(FormControl, { label: '产品名称: ', type: 'text', name: 'prod_name', maxLength: '125', grid: 1, required: true }),
                    React.createElement(FormControl, { label: '产品单价: ', type: 'number', name: 'prod_price', maxLength: '11', grid: 1, required: true }),
                    React.createElement(FormControl, { label: '产品品牌: ', type: 'text', name: 'prod_brand', maxLength: '50', grid: 1 }),
                    React.createElement(FormControl, { label: '产品类型: ', type: 'text', name: 'prod_type', grid: 1 }),
                    React.createElement(FormControl, { label: '产品型号: ', type: 'text', name: 'prod_model', grid: 1 }),
                    React.createElement(FormControl, { label: '产品规格: ', type: 'text', name: 'prod_specifications', grid: 1 })
                )
            )
        );
    }
});

module.exports = Page;
