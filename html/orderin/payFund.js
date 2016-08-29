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
const DateTime = require('../lib/DateTime');
const Form = require('../lib/Form');
const moment = require('../lib/moment');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const AutoComplete = require('../lib/AutoComplete');
const Format = require('../format');
const FontIcon = require('../lib/FontIcon');
const TextArea = require('../lib/TextArea');
const Dialog = require('../lib/Dialog');
const OpenDialog = require('../lib/mixins/OpenDialog');
const ReactRouter = require('react-router');
const hashHistory = ReactRouter.hashHistory;

const ImportService = require("../services/ImportService");
const ProviderService = require("../services/ProviderService");
const ProductService = require("../services/ProductService");

let Page = React.createClass({
    displayName: 'Page',

    mixins: [OpenDialog],
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
        let comment = this.refs.fund_comment.getValue();
        let params = {
            ord_no: this.props.params.ord_no,
            fund: fund,
            comment: comment
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
            data[0] = React.createElement(
                'span',
                null,
                '已签合同',
                React.createElement('br', null),
                '(',
                moment(orderIn.ord_time).format("YYYY-MM-DD"),
                ')'
            );
        }
        let status_index = status;
        if (status == 2) {
            data = ["已签合同", "预付款已发货", "已付款", "已入库"];
            status_index = 1;
            data[1] = React.createElement(
                'span',
                null,
                '预付款已发货',
                React.createElement('br', null),
                '(',
                moment(orderIn.send_time).format("YYYY-MM-DD"),
                ')'
            );
        }
        if (status == 3) {
            status_index = 2;
        }
        if (status >= 3) {
            data[2] = React.createElement(
                'span',
                null,
                '已付款',
                React.createElement('br', null),
                '(',
                moment(orderIn.fund_time).format("YYYY-MM-DD"),
                ')'
            );
        }
        if (status == 4) {
            status_index = 3;
            data[3] = React.createElement(
                'span',
                null,
                '已发货',
                React.createElement('br', null),
                '(',
                moment(orderIn.send_time).format("YYYY-MM-DD"),
                ')'
            );
        }
        if (status >= 4) {
            data[3] = React.createElement(
                'span',
                null,
                '已发货',
                React.createElement('br', null),
                '(',
                moment(orderIn.send_time).format("YYYY-MM-DD"),
                ')'
            );
        }
        if (status == 10) {
            status_index = 4;
            data[status_index] = React.createElement(
                'span',
                null,
                '已入库',
                React.createElement('br', null),
                '(',
                moment(orderIn.arrival_time).format("YYYY-MM-DD"),
                ')'
            );
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
                messages: { min: "付款金额需大于1" } })),
            React.createElement(FormControl, { label: '付款情况: ', ref: 'fund_comment', type: 'textarea', name: 'comment' })
        );
    },

    closeSendDialog() {
        this.refs.sendTip.close();
    },

    sendResult() {
        let isValid = this.refs.send_time.check();
        if (isValid) {
            let sendTime = this.refs.send_time.getValue();
            ImportService.setStatus(this.props.params.ord_no, Format.ORDER_STATUS.SEND, sendTime, ret => {
                if (ret) {
                    window.location.reload();
                } else {
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
    },

    closeImportDialog() {
        this.refs.importTip.close();
    },

    importResult() {
        let isValid = this.refs.arrival_time.check();
        if (isValid) {
            let arrivalTime = this.refs.arrival_time.getValue();
            ImportService.setStatus(this.props.params.ord_no, Format.ORDER_STATUS.IMPORTED, arrivalTime, ret => {
                if (ret) {
                    window.location.reload();
                } else {
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
    },

    saveVoucher(flag) {
        if (flag) {
            let isValid = this.refs.voucher.check();
            if (isValid) {
                let voucher = this.refs.voucher.getValue();
                ImportService.setVoucher(this.props.params.ord_no, voucher, ret => {
                    if (ret) {
                        window.location.reload();
                    } else {
                        this.refs.tip.show("提交失败");
                        this.refs.tip.setData(false);
                    }
                });
            } else {
                return false;
            }
        }

        return true;
    },

    renderPayButton() {
        let orderIn = this.state.orderIn;
        let voucherBtn = null;
        if (orderIn) {
            if (!orderIn.voucher) {
                voucherBtn = React.createElement(
                    Button,
                    { theme: 'success', className: 'ml-20', raised: true, icon: 'paypal', ref: 'btn_2', 'data-toggle': 'dialog', 'data-target': 'voucherTip' },
                    '填写凭证号'
                );
            }

            if (orderIn.ord_fund_remain > 0) {
                return React.createElement(
                    Label,
                    { className: 'mt-20 text-center mb-30' },
                    React.createElement(
                        Button,
                        { theme: 'success', raised: true, icon: 'cc-visa', ref: 'btn_4', 'data-toggle': 'dialog', 'data-target': 'pay_dialog' },
                        '付 款'
                    ),
                    voucherBtn
                );
            } else {
                if (orderIn.ord_status == Format.ORDER_STATUS.FUNDED) {
                    return React.createElement(
                        Label,
                        { className: 'mt-20 text-center mb-30' },
                        React.createElement(
                            Button,
                            { theme: 'success', raised: true, icon: 'cc-visa', ref: 'btn_5', 'data-toggle': 'dialog', 'data-target': 'sendTip' },
                            '已发货'
                        ),
                        voucherBtn
                    );
                } else if (orderIn.ord_status == Format.ORDER_STATUS.SEND) {
                    return React.createElement(
                        Label,
                        { className: 'mt-20 text-center mb-30' },
                        React.createElement(
                            Button,
                            { theme: 'success', raised: true, icon: 'cc-visa', ref: 'btn_3', 'data-toggle': 'dialog', 'data-target': 'importTip' },
                            '已入库'
                        ),
                        voucherBtn
                    );
                } else {
                    return React.createElement(
                        Label,
                        { className: 'mt-20 text-center mb-30' },
                        voucherBtn
                    );
                }
            }
        }
        return React.createElement(Label, { className: 'mt-20 text-center mb-30' });
    },

    initInvoiceData() {
        let order = this.state.orderIn;
        if (order) {
            let start = order.invoice_start ? moment(order.invoice_start).format("YYYY-MM-DD") : "";
            this.refs.invoice_start.setValue(start);
            let end = order.invoice_arrival ? moment(order.invoice_arrival).format("YYYY-MM-DD") : "";
            this.refs.invoice_arrival.setValue(end);
        }
    },

    saveInvoice(flag) {
        if (flag) {
            let invoice_start = this.refs.invoice_start.getValue();
            let invoice_arrival = this.refs.invoice_arrival.getValue();
            if (invoice_start || invoice_arrival) {
                let params = {};
                if (invoice_start) {
                    params["invoice_start"] = invoice_start;
                }
                if (invoice_arrival) {
                    params["invoice_arrival"] = invoice_arrival;
                }

                ImportService.saveInvoice(this.props.params.ord_no, params, ret => {
                    if (ret) {
                        window.location.reload();
                    } else {
                        this.refs.tip.show("提交失败");
                        this.refs.tip.setData(false);
                    }
                });
            }
        }
        return true;
    },

    render() {
        let scope = this;
        let orderIn = this.state.orderIn;

        let amountFormat = function (value, column, row) {
            return value + "(" + row.prod_unit + ")";
        };
        let header = [{ name: "prod_name", text: "名称", tip: true }, { name: "prod_price", text: "单价" }, { name: "prod_model", text: "型号" }, { name: "prod_amount", text: "数量", format: amountFormat }, { name: "prod_fund", text: "总价" }];

        let fundHeader = [{ name: "time", text: "付款时间", width: "25%" }, { name: "fund", text: "付款金额(元)", width: "25%" }, { name: "remain", text: "未付款金额(元)", width: "25%" }, { name: "comment", text: "付款情况", width: "25%" }];

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

        let send_footers = {
            components: [React.createElement(
                Button,
                { theme: 'success', className: 'mr-20', onClick: this.sendResult, raised: true, icon: 'check' },
                '确 定'
            ), React.createElement(
                Button,
                { theme: 'info', className: 'ml-20', onClick: this.closeSendDialog, raised: true, icon: 'times' },
                '取 消'
            )]
        };

        let arrival_footers = {
            components: [React.createElement(
                Button,
                { theme: 'success', className: 'mr-20', onClick: this.importResult, raised: true, icon: 'check' },
                '确 定'
            ), React.createElement(
                Button,
                { theme: 'info', className: 'ml-20', onClick: this.closeImportDialog, raised: true, icon: 'times' },
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
                    orderIn ? orderIn.ord_fund : "--",
                    '元'
                ),
                React.createElement(
                    Label,
                    { grid: 0.5 },
                    '剩余金额: ',
                    orderIn ? orderIn.ord_fund_remain : "--",
                    '元'
                ),
                React.createElement(
                    'div',
                    { className: 'mt-20' },
                    this.renderForm()
                )
            ),
            React.createElement(
                Dialog,
                { title: '已发货', ref: 'sendTip', grid: 0.3, footers: send_footers },
                React.createElement(
                    'div',
                    { className: 'mt-20' },
                    React.createElement(FormControl, { label: '填写发货时间: ', ref: 'send_time', type: 'datetime', name: 'sendTime', dateOnly: true, required: true })
                )
            ),
            React.createElement(
                Dialog,
                { title: '已入库', ref: 'importTip', grid: 0.3, footers: arrival_footers },
                React.createElement(
                    'div',
                    { className: 'mt-20' },
                    React.createElement(FormControl, { label: '填写入库时间: ', ref: 'arrival_time', type: 'datetime', dateOnly: true, required: true })
                )
            ),
            React.createElement(
                Dialog,
                { title: '填写凭证号', ref: 'voucherTip', grid: 0.3, onConfirm: this.saveVoucher },
                React.createElement(
                    'div',
                    { className: 'mt-20' },
                    React.createElement(
                        FormControl,
                        { label: '凭证号: ', className: 'flex', ref: 'voucher', name: 'voucher', required: true },
                        React.createElement(Input, { type: 'text', className: 'auto' })
                    )
                )
            ),
            React.createElement(
                Dialog,
                { title: '修改发票信息', ref: 'invoiceTip', grid: 0.3, onConfirm: this.saveInvoice, onOpen: this.initInvoiceData },
                React.createElement(
                    'div',
                    { className: 'mt-20' },
                    React.createElement(
                        FormControl,
                        { label: '开票时间: ', className: 'flex vertical-center', ref: 'invoice_start', name: 'invoice_start' },
                        React.createElement(DateTime, { dateOnly: true, className: 'auto' })
                    ),
                    React.createElement(
                        FormControl,
                        { label: '到票时间: ', className: 'flex', ref: 'invoice_arrival', name: 'invoice_arrival' },
                        React.createElement(DateTime, { dateOnly: true, className: 'auto' })
                    )
                )
            ),
            React.createElement(MessageBox, { title: '提示', ref: 'tip', confirm: this.payResult }),
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
                        { grid: 0.5, className: 'mt-10' },
                        React.createElement(
                            'div',
                            { className: 'flex' },
                            React.createElement(
                                'span',
                                { className: 'details-label' },
                                React.createElement('img', { src: IMGPATH + "contract.png" }),
                                ' 采购合同号: '
                            ),
                            React.createElement(
                                'span',
                                { className: 'ml-10 underline auto' },
                                orderIn ? orderIn.ord_contract : ""
                            )
                        )
                    ),
                    React.createElement(
                        Label,
                        { grid: 0.5, className: 'mt-10' },
                        React.createElement(
                            'div',
                            { className: 'flex' },
                            React.createElement(
                                'span',
                                { className: 'details-label' },
                                React.createElement('img', { src: IMGPATH + "contract.png" }),
                                ' 销售合同号: '
                            ),
                            React.createElement(
                                'span',
                                { className: 'ml-10 underline auto' },
                                orderIn ? orderIn.sale_contract : ""
                            )
                        )
                    ),
                    React.createElement(
                        Label,
                        { grid: 0.5, className: 'mt-10' },
                        React.createElement(
                            'div',
                            { className: 'flex' },
                            React.createElement(
                                'span',
                                { className: 'details-label' },
                                React.createElement('img', { src: IMGPATH + "icon-gys.png" }),
                                ' ',
                                React.createElement(
                                    'span',
                                    { className: 'letter-space-1' },
                                    '供应商'
                                ),
                                ': '
                            ),
                            React.createElement(
                                'span',
                                { className: 'ml-10 underline auto' },
                                orderIn ? orderIn.prov_name : ""
                            )
                        )
                    ),
                    React.createElement(
                        Label,
                        { grid: 0.5, className: 'mt-10' },
                        React.createElement(
                            'div',
                            { className: 'flex' },
                            React.createElement(
                                'span',
                                { className: 'details-label' },
                                React.createElement('img', { src: IMGPATH + "icon-clock.png" }),
                                ' ',
                                React.createElement(
                                    'span',
                                    { className: 'letter-space-2' },
                                    '签订日期'
                                ),
                                ': '
                            ),
                            React.createElement(
                                'span',
                                { className: 'ml-10 underline auto' },
                                orderIn ? moment(orderIn.ord_time).format("YYYY-MM-DD") : ""
                            )
                        )
                    ),
                    React.createElement(
                        Label,
                        { grid: 0.5, className: 'mt-10' },
                        React.createElement(
                            'div',
                            { className: 'flex' },
                            React.createElement(
                                'span',
                                { className: 'details-label' },
                                React.createElement('img', { src: IMGPATH + "icon-pz.png" }),
                                ' ',
                                React.createElement(
                                    'span',
                                    { className: 'letter-space-1' },
                                    '凭证号'
                                ),
                                ': '
                            ),
                            React.createElement(
                                'span',
                                { className: 'ml-10 underline auto' },
                                orderIn ? orderIn.voucher : ""
                            )
                        )
                    ),
                    React.createElement(
                        Label,
                        { grid: 1, className: 'mt-10' },
                        React.createElement(
                            'div',
                            { className: 'flex' },
                            React.createElement(
                                'span',
                                { className: 'details-label' },
                                React.createElement('img', { src: IMGPATH + "icon-comment.png" }),
                                ' ',
                                React.createElement(
                                    'span',
                                    { className: 'letter-space-3' },
                                    '备注'
                                ),
                                ': '
                            ),
                            React.createElement(
                                'span',
                                { className: 'ml-10 underline auto' },
                                orderIn ? orderIn.ord_comment : ""
                            )
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
            React.createElement(
                Label,
                { grid: 1, className: 'mt-20' },
                React.createElement(
                    Tile,
                    { header: React.createElement(
                            'span',
                            { className: 'flex vertical-center' },
                            React.createElement('img', { src: IMGPATH + "icon-fp.png" }),
                            ' 发票信息',
                            React.createElement(
                                'span',
                                { className: 'auto text-right' },
                                React.createElement(
                                    Button,
                                    { icon: 'edit', theme: 'success', className: 'editBtn', ref: 'btn_1', 'data-toggle': 'dialog', 'data-target': 'invoiceTip' },
                                    '编辑'
                                )
                            )
                        ) },
                    React.createElement(
                        Label,
                        { grid: 0.5, className: 'mt-10' },
                        React.createElement(
                            'div',
                            { className: 'flex' },
                            React.createElement(
                                'span',
                                { className: 'details-label' },
                                React.createElement('img', { src: IMGPATH + "icon-clock.png" }),
                                ' 开票时间: '
                            ),
                            React.createElement(
                                'span',
                                { className: 'ml-10 auto' },
                                orderIn && orderIn.invoice_start ? moment(orderIn.invoice_start).format("YYYY-MM-DD") : ""
                            )
                        )
                    ),
                    React.createElement(
                        Label,
                        { grid: 0.5, className: 'mt-10' },
                        React.createElement(
                            'div',
                            { className: 'flex' },
                            React.createElement(
                                'span',
                                { className: 'details-label' },
                                React.createElement('img', { src: IMGPATH + "icon-clock.png" }),
                                ' 到票时间: '
                            ),
                            React.createElement(
                                'span',
                                { className: 'ml-10 auto' },
                                orderIn && orderIn.invoice_arrival ? moment(orderIn.invoice_arrival).format("YYYY-MM-DD") : ""
                            )
                        )
                    )
                )
            ),
            this.renderPayButton()
        );
    }
});

module.exports = Page;
