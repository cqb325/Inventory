const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');
const Input = require('../lib/Input');
const Select = require('../lib/Select');
const Form = require('../lib/Form');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const AutoComplete = require('../lib/AutoComplete');
const Format = require('../format');
const TextArea = require('../lib/TextArea');

const ExportService = require("../services/ExportService");
const ClientService = require("../services/ClientService");
const ProductService = require("../services/ProductService");

let Page = React.createClass({
    displayName: 'Page',


    getInitialState() {
        this.products = {};
        this.funds = {};
        this.counts = {};
        this.prices = {};
        return {};
    },

    payFund() {
        let ord_no = this.refs.tip.getData();
        if (ord_no) {
            window.location.href = "#export_payFund/" + ord_no;
        }
    },

    componentDidMount() {
        this.loadAllClients();
        this.loadAllProducts();
    },

    loadAllClients() {
        ClientService.getAll(clients => {
            this.refs.client.item.setData(clients);
        });
    },

    loadAllProducts() {
        ProductService.getAllStoredProducts(products => {
            if (products) {
                products.forEach(product => {
                    this.products[product.prod_id] = product;
                });
            }
            window.setTimeout(() => {
                this.refs.table.setData(products);
            }, 0);
        });
    },

    add2Warehouse(row) {
        let import_table_Data = this.refs.import_table.state.data;
        import_table_Data.push(row);
        this.refs.import_table.setData(import_table_Data);

        let table_Data = this.refs.table.state.data;
        let filter_data = table_Data.filter(function (item) {
            if (item == row) {
                return false;
            }
            return true;
        });

        this.refs.table.setData(filter_data);
    },

    removeFromWarehouse(row) {
        let import_table_Data = this.refs.import_table.state.data;
        let filter_data = import_table_Data.filter(function (item) {
            if (item == row) {
                return false;
            }
            return true;
        });
        this.refs.import_table.setData(filter_data);

        let table_Data = this.refs.table.state.data;
        table_Data.push(row);
        this.refs.table.setData(table_Data);

        delete this.funds[row.prod_id];
        delete this.counts[row.prod_id];
        delete this.prices[row.prod_id];

        window.setTimeout(() => {
            this.updateTotalFund();
        }, 10);
    },

    updateFund(count, row) {
        let fundEle = this.funds[row.prod_id];
        let price = this.prices[row.prod_id].getValue() || 0;
        count = this.counts[row.prod_id].getValue() || 0;

        let fund = count * price;
        fundEle.setValue(fund);

        window.setTimeout(() => {
            this.updateTotalFund();
        }, 0);
    },

    /**
     * 更新总价
     */
    updateTotalFund() {
        let total = 0;
        for (let i in this.funds) {
            let fundEle = this.funds[i];
            if (fundEle) {
                let val = fundEle.getValue();
                if (val) {
                    total += parseFloat(val);
                }
            }
        }

        let totalEle = ReactDOM.findDOMNode(this.refs.total);
        totalEle.innerHTML = total;
    },

    saveForm() {
        let totalEle = ReactDOM.findDOMNode(this.refs.total);
        let total = totalEle.innerHTML;

        let formItems = this.refs.form.getItems();
        let params = {
            ord_contract: formItems["ord_contract"].ref.getValue(),
            prov_id: formItems["cli_id"].ref.getValue(),
            ord_comment: formItems["ord_comment"].ref.getValue(),
            ord_fund: total
        };

        let import_table_Data = this.refs.import_table.state.data;

        let prod_params = [];
        import_table_Data.forEach(item => {
            let prod_amount = this.counts[item.prod_id].getValue();
            let prod_fund = this.funds[item.prod_id].getValue();
            let prod_price = this.prices[item.prod_id].getValue();
            prod_params.push({
                prod_id: item.prod_id,
                prod_amount: prod_amount,
                prod_fund: prod_fund,
                prod_price: prod_price
            });
        });

        ExportService.addOrder(params, prod_params, ret => {
            if (ret) {
                this.refs.tip.show("提交成功");
                this.refs.tip.setData(ret);
            } else {
                this.refs.tip.show("提交失败");
                this.refs.tip.setData(false);
            }
        });
    },

    render() {
        let scope = this;
        let btnFormat = function (value, column, row) {
            return React.createElement(
                Button,
                { theme: 'success', flat: true, onClick: scope.add2Warehouse.bind(scope, row) },
                '出库'
            );
        };

        let btnFormat2 = function (value, column, row) {
            return React.createElement(
                Button,
                { theme: 'success', flat: true, onClick: scope.removeFromWarehouse.bind(scope, row) },
                '删除'
            );
        };

        let countFormat = function (value, column, row) {
            return React.createElement(
                'span',
                null,
                React.createElement(FormControl, { style: { width: "80px" }, ref: ref => {
                        scope.counts[row.prod_id] = ref;
                    }, name: 'count', type: 'number',
                    rules: { required: true, max: row.amount },
                    onValid: (value, valid) => {
                        if (!valid) {
                            scope.counts[row.prod_id].setValue("");
                            scope.funds[row.prod_id].setValue("");
                            scope.updateFund(0, row);
                        } else {
                            scope.updateFund(value, row);
                        }
                    }
                }),
                Format.unitDataMap[row.prod_unit]
            );
        };

        let fundFormat = function (value, column, row) {
            return React.createElement(
                'span',
                null,
                React.createElement(FormControl, { style: { width: "80px" }, ref: ref => {
                        scope.funds[row.prod_id] = ref;
                    }, name: 'fund', type: 'number', grid: 0.7 }),
                '元'
            );
        };

        let priceFormat = function (value, column, row) {
            return React.createElement(
                'span',
                null,
                React.createElement(FormControl, { style: { width: "80px" },
                    ref: ref => {
                        scope.prices[row.prod_id] = ref;
                    },
                    name: 'price', type: 'number',
                    rules: { required: true },
                    onChange: () => {
                        scope.updateFund(null, row);
                    },
                    value: row.prod_price })
            );
        };

        let header = [{ name: "prod_name", text: "名称", tip: true }, { name: "prod_price", text: "单价" }, { name: "prod_model", text: "型号" }, { name: "amount", text: "剩余量" }, { name: "op", text: "操作", format: btnFormat }];
        let header2 = [{ name: "prod_name", text: "名称", tip: true }, { name: "prod_price", text: "单价", format: priceFormat }, { name: "amount", text: "剩余量" }, { name: "prod_num", text: "数量", format: countFormat }, { name: "prod_fund", text: "总价", format: fundFormat }, { name: "op", text: "操作", format: btnFormat2 }];
        return React.createElement(
            'div',
            { className: 'main-container' },
            React.createElement(MessageBox, { title: '提示', ref: 'tip', confirm: this.payFund }),
            React.createElement(
                Label,
                { className: 'searchTools mt-30 mb-20', component: 'div' },
                React.createElement(
                    Label,
                    { grid: 0.3 },
                    React.createElement(
                        'h4',
                        null,
                        '出库'
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
                { header: '出库信息' },
                React.createElement(
                    'ul',
                    { className: 'nav nav-pills nav-justified step step-progress' },
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            null,
                            React.createElement(
                                'span',
                                null,
                                '已签合同'
                            ),
                            React.createElement('span', { className: 'caret' })
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            null,
                            React.createElement(
                                'span',
                                null,
                                '预付款'
                            ),
                            React.createElement('span', { className: 'caret' })
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            null,
                            React.createElement(
                                'span',
                                null,
                                '已付款'
                            ),
                            React.createElement('span', { className: 'caret' })
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            null,
                            React.createElement(
                                'span',
                                null,
                                '已发货'
                            ),
                            React.createElement('span', { className: 'caret' })
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            null,
                            React.createElement(
                                'span',
                                null,
                                '已入库'
                            ),
                            React.createElement('span', { className: 'caret' })
                        )
                    )
                ),
                React.createElement(
                    Form,
                    { ref: 'form', method: 'custom', layout: 'stack', useDefaultSubmitBtn: false },
                    React.createElement(FormControl, { label: '合同号: ', type: 'text', name: 'ord_contract', grid: 1, required: true }),
                    React.createElement(FormControl, { label: '客户: ', ref: 'client', type: 'autocomplete', data: [], name: 'cli_id', grid: 1, required: true }),
                    React.createElement(FormControl, { label: '备注: ', type: 'textarea', name: 'ord_comment', grid: 1 })
                )
            ),
            React.createElement(
                Label,
                { grid: 0.45, style: { "verticalAlign": "top" } },
                React.createElement(
                    Tile,
                    { header: '库存产品' },
                    React.createElement(Table, { ref: 'table', header: header, data: [], striped: true, className: 'text-center' })
                )
            ),
            React.createElement(
                Label,
                { grid: { width: 0.54, offset: 0.01 } },
                React.createElement(
                    Tile,
                    { header: '出库产品' },
                    React.createElement(Table, { ref: 'import_table', header: header2, data: [], striped: true, className: 'text-center' })
                ),
                React.createElement(
                    'span',
                    null,
                    '总价: ',
                    React.createElement('span', { ref: 'total' }),
                    '元'
                )
            ),
            React.createElement(
                Label,
                { className: 'mt-20 text-center mb-30' },
                React.createElement(
                    Button,
                    { theme: 'success', raised: true, onClick: this.saveForm },
                    '收 款'
                )
            )
        );
    }
});

module.exports = Page;
