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

const ProviderService = require("../services/ProviderService");
const DistrictService = require("../services/DistrictService");

let Page = React.createClass({
    displayName: 'Page',


    getInitialState() {
        return {
            provider: null
        };
    },

    submit() {
        let formItems = this.refs.form.getItems();
        let params = {
            prov_id: this.props.params.id,
            prov_name: formItems["prov_name"].ref.getValue(),
            prov_address: formItems["prov_address"].ref.getValue(),
            prov_type: formItems["prov_type"].ref.getValue(),
            prov_phone: formItems["prov_phone"].ref.getValue(),
            prov_areaid: formItems["prov_areaid"].ref.getValue(),
            prov_contactName: formItems["prov_contactName"].ref.getValue()
        };

        ProviderService.saveEdit(params, ret => {
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
            window.location.href = "#SupplierList";
        }
    },

    getDistrictByParentId(parentid, callback) {
        DistrictService.getChildrenByParentId(parentid, district => {
            callback(district);
        });
    },

    componentDidMount() {
        ProviderService.getProvider(this.props.params.id, provider => {
            this.setState({ provider });

            if (provider) {
                let prov_distValue = {
                    id: provider.prov_areaid,
                    text: provider.dist_mergername
                };
                this.refs.comboTree.item.setValue(prov_distValue);
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
        let provider = this.state.provider;
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
                        '编辑供应商'
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
                { header: '供应商信息' },
                React.createElement(
                    Form,
                    { ref: 'form', method: 'custom', layout: 'stack', submit: this.submit },
                    React.createElement(FormControl, { label: '供应商名称: ', value: provider ? provider.prov_name : "", type: 'text', name: 'prov_name', maxLength: '75', grid: 1, required: true }),
                    React.createElement(FormControl, { label: '供应商区县: ', value: provider ? provider.prov_areaid : "", ref: 'comboTree', data: treeData, type: 'combotree', name: 'prov_areaid', grid: 1, required: true }),
                    React.createElement(FormControl, { label: '供应商地址: ', value: provider ? provider.prov_address : "", type: 'text', name: 'prov_address', maxLength: '250', grid: 1 }),
                    React.createElement(FormControl, { label: '产品类型: ', value: provider ? provider.prov_type : "", type: 'text', name: 'prov_type', maxLength: '75', grid: 1 }),
                    React.createElement(FormControl, { label: '联系电话: ', value: provider ? provider.prov_phone : "", type: 'number', name: 'prov_phone', maxLength: '18', grid: 1 }),
                    React.createElement(FormControl, { label: '联系人: ', value: provider ? provider.prov_contactName : "", type: 'text', name: 'prov_contactName', maxLength: '10', grid: 1 })
                )
            )
        );
    }
});

module.exports = Page;
