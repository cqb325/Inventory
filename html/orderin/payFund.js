var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
const moment = require('../lib/moment');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const AutoComplete = require('../lib/AutoComplete');
const Format = require('../format');
const FontIcon = require('../lib/FontIcon');
const TextArea = require('../lib/TextArea');
const Dialog = require('../lib/Dialog');
const ReactRouter = require('react-router');
const hashHistory = ReactRouter.hashHistory;

const ImportService = require("../services/ImportService");
const ProviderService = require("../services/ProviderService");
const ProductService = require("../services/ProductService");

let Page = React.createClass({
    displayName: 'Page',


    getInitialState() {
        return {
            orderIn: null
        };
    },

    payResult() {
        if (this.refs.tip.getData()) {
            window.location.reload();
        }
    },

    showPayDialog() {
        this.refs.pay_dialog.open();
    },

    closeDialog() {
        this.refs.pay_dialog.close();
    },

    componentDidMount() {
        this.loadOrderInInfo();
        this.loadProducts();
        this.loadPayFund();
    },

    loadOrderInInfo() {
        ImportService.getOrderIn(this.props.params.ord_no, orderIn => {
            this.setState({ orderIn });
        });
    },

    loadProducts() {
        ImportService.getProducts(this.props.params.ord_no, products => {
            this.refs.import_table.setData(products);
        });
    },

    loadPayFund() {
        ImportService.getPayFunds(this.props.params.ord_no, funds => {
            this.refs.fundTable.setData(funds);
        });
    },

    submitFund() {
        let fund = this.refs.fund_ele.getValue();
        let params = {
            ord_no: this.props.params.ord_no,
            fund: fund
        };
        let orderIn = this.state.orderIn;
        ImportService.payFund(params, orderIn, ret => {
            if (ret) {
                this.refs.tip.show("付款成功");
                this.refs.tip.setData(true);
            } else {
                this.refs.tip.show("付款失败");
                this.refs.tip.setData(false);
            }
        });
    },

    submitForm() {
        this.refs.form.submit();
    },

    renderStatus() {
        let orderIn = this.state.orderIn;
        let data = ["已签合同", "预付款", "已付款", "已发货", "已入库"];
        let status = 0;
        if (orderIn) {
            status = orderIn.ord_status;
        }
        let status_index = status;
        if (status == 2) {
            data = ["已签合同", "预付款已发货", "已付款", "已入库"];
            status_index = 1;
        }
        if (status == 3) {
            status_index = 2;
        }
        if (status == 4) {
            status_index = 3;
        }
        if (status == 10) {
            status_index = 4;
        }

        let eles = data.map((item, index) => {
            let clazz = index <= status_index ? "active" : "";
            return React.createElement(
                'li',
                { className: clazz, key: index },
                React.createElement(
                    'a',
                    null,
                    React.createElement(
                        'span',
                        null,
                        item
                    ),
                    React.createElement('span', { className: 'caret' })
                )
            );
        });
        return React.createElement(
            'ul',
            { className: 'nav nav-pills nav-justified step step-progress' },
            eles
        );
    },

    renderForm() {
        let orderIn = this.state.orderIn;

        let props = {
            disabled: true
        };
        if (orderIn) {
            props = {};

            window.setTimeout(() => {
                this.refs.fund_ele.setRule("max", orderIn.ord_fund_remain);
                this.refs.fund_ele.setMessage("max", "付款金额在1~" + orderIn.ord_fund_remain + "之间");
            }, 0);
        }
        return React.createElement(
            Form,
            { ref: 'form', method: 'custom', useDefaultSubmitBtn: false, submit: this.submitFund },
            React.createElement(FormControl, _extends({ label: '付款金额: ', ref: 'fund_ele', type: 'number', name: 'fund' }, props, { required: true, rules: { min: 1 },
                messages: { min: "付款金额需大于1" } }))
        );
    },

    showSendDialog() {
        this.refs.sendTip.show("确认已经发货?");
    },

    sendResult(flag) {
        if (flag) {
            ImportService.setStatus(this.props.params.ord_no, Format.ORDER_STATUS.SEND, ret => {
                if (ret) {
                    window.location.reload();
                } else {
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
        return true;
    },

    showImportedDialog() {
        this.refs.importTip.show("确认已经入库?");
    },

    importResult(flag) {
        if (flag) {
            ImportService.setStatus(this.props.params.ord_no, Format.ORDER_STATUS.IMPORTED, ret => {
                if (ret) {
                    window.location.reload();
                } else {
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
        return true;
    },

    renderPayButton() {
        let orderIn = this.state.orderIn;
        if (orderIn) {
            if (orderIn.ord_fund_remain > 0) {
                return React.createElement(
                    Label,
                    { className: 'mt-20 text-center mb-30' },
                    React.createElement(
                        Button,
                        { theme: 'success', raised: true, icon: 'cc-visa', onClick: this.showPayDialog },
                        '付 款'
                    )
                );
            } else {
                if (orderIn.ord_status == Format.ORDER_STATUS.FUNDED) {
                    return React.createElement(
                        Label,
                        { className: 'mt-20 text-center mb-30' },
                        React.createElement(
                            Button,
                            { theme: 'success', raised: true, icon: 'cc-visa', onClick: this.showSendDialog },
                            '已发货'
                        )
                    );
                } else if (orderIn.ord_status == Format.ORDER_STATUS.SEND) {
                    return React.createElement(
                        Label,
                        { className: 'mt-20 text-center mb-30' },
                        React.createElement(
                            Button,
                            { theme: 'success', raised: true, icon: 'cc-visa', onClick: this.showImportedDialog },
                            '已入库'
                        )
                    );
                } else {
                    return React.createElement(Label, { className: 'mt-20 text-center mb-30' });
                }
            }
        }
        return React.createElement(Label, { className: 'mt-20 text-center mb-30' });
    },

    render() {
        let scope = this;
        let orderIn = this.state.orderIn;

        let amountFormat = function (value, column, row) {
            return value + "(" + row.prod_unit + ")";
        };
        let header = [{ name: "prod_name", text: "名称", tip: true }, { name: "prod_price", text: "单价" }, { name: "prod_model", text: "型号" }, { name: "prod_amount", text: "数量", format: amountFormat }, { name: "prod_fund", text: "总价" }];

        let fundHeader = [{ name: "time", text: "付款时间", width: "50%" }, { name: "fund", text: "付款金额(元)", width: "50%" }];

        let details_footers = {
            components: [React.createElement(
                Button,
                { theme: 'success', className: 'mr-20', onClick: this.submitForm, raised: true, icon: 'check' },
                '提 交'
            ), React.createElement(
                Button,
                { theme: 'info', className: 'ml-20', onClick: this.closeDialog, raised: true, icon: 'times' },
                '取 消'
            )]
        };

        return React.createElement(
            'div',
            { className: 'main-container' },
            React.createElement(
                Dialog,
                { title: '预付款', ref: 'pay_dialog', grid: 0.3, footers: details_footers },
                React.createElement(
                    Label,
                    { grid: 0.5 },
                    '总金额: ',
                    orderIn ? orderIn.ord_fund : "--"
                ),
                React.createElement(
                    Label,
                    { grid: 0.5 },
                    '剩余金额: ',
                    orderIn ? orderIn.ord_fund_remain : "--"
                ),
                React.createElement(
                    'div',
                    { className: 'mt-20' },
                    this.renderForm()
                )
            ),
            React.createElement(MessageBox, { title: '提示', ref: 'tip', confirm: this.payResult }),
            React.createElement(MessageBox, { title: '提示', type: 'confirm', ref: 'sendTip', confirm: this.sendResult }),
            React.createElement(MessageBox, { title: '提示', type: 'confirm', ref: 'importTip', confirm: this.importResult }),
            React.createElement(
                Label,
                { className: 'searchTools mt-30 mb-20', component: 'div' },
                React.createElement(
                    Label,
                    { grid: 0.3 },
                    React.createElement(
                        'h4',
                        null,
                        '入库信息'
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
                { header: React.createElement(
                        'span',
                        null,
                        React.createElement('img', { src: IMGPATH + "contract.png" }),
                        ' 合同信息'
                    ) },
                this.renderStatus(),
                React.createElement(
                    Label,
                    { grid: 1, className: 'mt-30' },
                    React.createElement(
                        Label,
                        { grid: 1, className: 'mt-10' },
                        React.createElement(
                            'span',
                            null,
                            React.createElement('img', { src: IMGPATH + "contract.png" }),
                            ' 合同号: '
                        ),
                        React.createElement(
                            'span',
                            { className: 'ml-10 underline' },
                            orderIn ? orderIn.ord_contract : ""
                        )
                    ),
                    React.createElement(
                        Label,
                        { grid: 1, className: 'mt-10' },
                        React.createElement(
                            'span',
                            null,
                            React.createElement('img', { src: IMGPATH + "icon-gys.png" }),
                            ' 供应商: '
                        ),
                        React.createElement(
                            'span',
                            { className: 'ml-10 underline' },
                            orderIn ? orderIn.prov_name : ""
                        )
                    ),
                    React.createElement(
                        Label,
                        { grid: 1, className: 'mt-10' },
                        React.createElement(
                            'span',
                            null,
                            React.createElement('img', { src: IMGPATH + "icon-clock.png" }),
                            ' 下单时间: '
                        ),
                        React.createElement(
                            'span',
                            { className: 'ml-10 underline' },
                            orderIn ? moment(orderIn.ord_time).format("YYYY-MM-DD HH:mm:ss") : ""
                        )
                    ),
                    React.createElement(
                        Label,
                        { grid: 1, className: 'mt-10' },
                        React.createElement(
                            'span',
                            null,
                            React.createElement('img', { src: IMGPATH + "icon-comment.png" }),
                            ' 备注: '
                        ),
                        React.createElement(
                            'span',
                            { className: 'ml-10 underline' },
                            orderIn ? orderIn.ord_comment : ""
                        )
                    )
                )
            ),
            React.createElement(
                Label,
                { grid: 1, className: 'mt-20' },
                React.createElement(
                    'span',
                    null,
                    '总价: ',
                    React.createElement(
                        'span',
                        { ref: 'total' },
                        orderIn ? orderIn.ord_fund : "--"
                    ),
                    '元'
                ),
                React.createElement(
                    'span',
                    { className: 'ml-30' },
                    '剩余: ',
                    React.createElement(
                        'span',
                        { ref: 'remain', style: { color: "red" } },
                        orderIn ? orderIn.ord_fund_remain : "--"
                    ),
                    '元'
                ),
                React.createElement(
                    Tile,
                    { header: React.createElement(
                            'span',
                            null,
                            React.createElement(FontIcon, { icon: 'dropbox', style: { color: "#EA8010" } }),
                            ' 入库产品'
                        ) },
                    React.createElement(Table, { ref: 'import_table', header: header, data: [], striped: true, className: 'text-center' })
                )
            ),
            React.createElement(
                Label,
                { grid: 1, className: 'mt-20' },
                React.createElement(
                    Tile,
                    { header: React.createElement(
                            'span',
                            null,
                            React.createElement(FontIcon, { icon: 'ticket', style: { color: "#EA8010" } }),
                            ' 付款记录'
                        ) },
                    React.createElement(Table, { ref: 'fundTable', header: fundHeader, data: [], striped: true, className: 'text-center' })
                )
            ),
            this.renderPayButton()
        );
    }
});

module.exports = Page;
