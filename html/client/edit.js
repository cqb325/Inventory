const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;

const Tile = require('../Tile');
const Input = require('../lib/Input');
const ComboTree = require('../lib/ComboTree');
const Form = require('../lib/Form');
const FormControl = require('../lib/FormControl');
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const MessageBox = require('../lib/MessageBox');

const ClientService = require("../services/ClientService");
const DistrictService = require("../services/DistrictService");

let Page = React.createClass({
    displayName: 'Page',


    getInitialState() {
        return {
            client: null
        };
    },

    submit() {
        let formItems = this.refs.form.getItems();
        let params = {
            cli_id: this.props.params.cli_id,
            cli_name: formItems["cli_name"].ref.getValue(),
            cli_address: formItems["cli_address"].ref.getValue(),
            cli_phone: formItems["cli_phone"].ref.getValue(),
            cli_areaid: formItems["cli_areaid"].ref.getValue(),
            cli_contact: formItems["cli_contact"].ref.getValue()
        };

        ClientService.saveEdit(params, ret => {
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
            window.location.href = "#ClientList";
        }
    },

    getDistrictByParentId(parentid, callback) {
        DistrictService.getChildrenByParentId(parentid, district => {
            callback(district);
        });
    },

    componentDidMount() {
        ClientService.getClient(this.props.params.cli_id, client => {
            this.setState({ client });

            if (client) {
                let cli_distValue = {
                    id: client.cli_areaid,
                    text: client.dist_mergername
                };
                this.refs.comboTree.item.setValue(cli_distValue);
            }
        });

        var comboTree = this.refs.comboTree.item;
        var tree = comboTree.getReference();

        tree.on("open", item => {
            if (item.open) {
                tree.deleteChildItems(item);
                this.getDistrictByParentId(item.id, items => {
                    tree.loadDynamicJSON(item, items);
                });
            }
        });
    },

    render() {
        let client = this.state.client;
        let treeData = [{
            id: "100000",
            text: "中国"
        }];

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
                        '编辑客户'
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
                { header: '客户信息' },
                React.createElement(
                    Form,
                    { ref: 'form', method: 'custom', layout: 'stack', submit: this.submit },
                    React.createElement(FormControl, { label: '客户名称: ', value: client ? client.cli_name : "", type: 'text', name: 'cli_name', maxLength: '75', grid: 1, required: true }),
                    React.createElement(FormControl, { label: '客户区县: ', value: client ? client.cli_areaid : "", ref: 'comboTree', data: treeData, type: 'combotree', name: 'cli_areaid', grid: 1, required: true }),
                    React.createElement(FormControl, { label: '客户地址: ', value: client ? client.cli_address : "", type: 'text', name: 'cli_address', maxLength: '250', grid: 1 }),
                    React.createElement(FormControl, { label: '联系电话: ', value: client ? client.cli_phone : "", type: 'number', name: 'cli_phone', maxLength: '18', grid: 1 }),
                    React.createElement(FormControl, { label: '联系人: ', value: client ? client.cli_contact : "", type: 'text', name: 'cli_contact', maxLength: '10', grid: 1 })
                )
            )
        );
    }
});

module.exports = Page;
