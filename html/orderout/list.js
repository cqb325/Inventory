/**
 * Created by cqb32_000 on 2016-07-19.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');
const Dialog = require('../lib/Dialog');
const Pagination = require('../lib/Pagination');
const Input = require('../lib/Input');
const DateTime = require('../lib/DateTime');
const Select = require('../lib/Select');
const DateRange = require('../lib/DateRange');
const moment = require('../lib/moment');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const Format = require('../format');

const ExportService = require("../services/ExportService");

let List = React.createClass({
    displayName: 'List',


    getInitialState() {
        this.pageNum = 1;
        this.pageSize = 15;
        return {};
    },

    reloadTableData(pageNum, pageSize) {
        let dateRange = this.refs.dateRange.getValue();
        let params = Object.assign({}, {
            pageNum: pageNum,
            pageSize: pageSize,
            cli_name: this.refs.cli_name.getValue(),
            startDate: dateRange[0],
            endDate: dateRange[1],
            ord_contract: this.refs.ord_contract.getValue(),
            ord_status: this.refs.ord_status.getValue()
        });

        ExportService.getPageList(params, ret => {
            this.refs.table.setData(ret.data);
            this.refs.pagination.update({
                current: ret.pageNum,
                pageSize: ret.pageSize,
                total: ret.total
            });

            this.pageNum = ret.pageNum;
            this.pageSize = ret.pageSize;
        });
    },

    search() {
        this.reloadTableData(this.pageNum, this.pageSize);
    },

    showConfirm(id) {
        this.refs.confirm.show("确认删除该合同记录？");
        this.refs.confirm.setData(id);
    },

    confirmDelete(flag) {
        if (flag) {
            var ord_no = this.refs.confirm.getData();
            ExportService.deleteOrder(ord_no, ret => {
                if (ret) {
                    this.refs.tip.show("删除成功");
                    this.refs.tip.setData(true);
                } else {
                    this.refs.tip.show("删除失败");
                    this.refs.tip.setData(false);
                }
            });

            return true;
        }
    },

    confirmDRefresh() {
        if (this.refs.tip.getData()) {
            this.search();
        }
    },

    componentDidMount() {
        this.reloadTableData();
    },

    sendConfirm(ord_no) {
        this.refs.sendTip.open();
        this.refs.sendTip.setData(ord_no);
    },

    importConfirm(ord_no) {
        this.refs.importTip.open();
        this.refs.importTip.setData(ord_no);
    },

    sendResult(flag) {
        let ord_no = this.refs.sendTip.getData();
        if (flag) {
            let isValida = this.refs.send_time.check();
            let isValidb = this.refs.send_tracking.check();
            if (isValida && isValidb) {
                let sendTime = this.refs.send_time.getValue();
                let send_tracking = this.refs.send_tracking.getValue();
                ExportService.setSendStatus(ord_no, Format.ORDER_STATUS.SEND, sendTime, send_tracking, ret => {
                    if (ret) {
                        this.search();
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

    importResult(flag) {
        let ord_no = this.refs.importTip.getData();
        if (flag) {
            let isValid = this.refs.arrival_time.check();
            if (isValid) {
                let arrivalTime = this.refs.arrival_time.getValue();
                ExportService.setStatus(ord_no, Format.ORDER_STATUS.IMPORTED, arrivalTime, ret => {
                    if (ret) {
                        this.search();
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

    render() {
        let scope = this;
        let btnFormat = function (value, column, row) {
            let btns = [];

            let deleteBtn = React.createElement(
                Button,
                { key: '1', theme: 'success', className: 'ml-10', icon: 'trash', flat: true, onClick: scope.showConfirm.bind(scope, row.prov_id) },
                '删除'
            );
            let payBtn = React.createElement(
                Button,
                { key: '2', theme: 'success', className: 'ml-10', icon: 'cc-visa', flat: true, href: "#export_payFund/" + row.ord_no },
                '收款'
            );
            let sendBtn = React.createElement(
                Button,
                { key: '3', theme: 'success', className: 'ml-10', icon: 'cc-visa', flat: true, onClick: scope.sendConfirm.bind(scope, row.ord_no) },
                '已发货'
            );
            let importBtn = React.createElement(
                Button,
                { key: '4', theme: 'success', className: 'ml-10', icon: 'cc-visa', flat: true, onClick: scope.importConfirm.bind(scope, row.ord_no) },
                '已收货'
            );
            let detailBtn = React.createElement(
                Button,
                { key: '5', theme: 'success', className: 'ml-10', icon: 'bars', flat: true, href: "#export_payFund/" + row.ord_no },
                '查看'
            );
            if (row.ord_status < Format.ORDER_STATUS.FUND) {
                btns.push(deleteBtn);
                btns.push(payBtn);
            } else if (row.ord_status == Format.ORDER_STATUS.FUND) {
                btns.push(payBtn);
                btns.push(sendBtn);
            } else if (row.ord_status == Format.ORDER_STATUS.FUND_SEND) {
                btns.push(payBtn);
                btns.push(detailBtn);
            } else if (row.ord_status == Format.ORDER_STATUS.FUNDED) {
                btns.push(sendBtn);
                btns.push(detailBtn);
            } else if (row.ord_status == Format.ORDER_STATUS.SEND) {
                btns.push(importBtn);
                btns.push(detailBtn);
            } else if (row.ord_status == Format.ORDER_STATUS.IMPORTED) {
                btns.push(detailBtn);
            }
            return React.createElement(
                'span',
                null,
                btns
            );
        };

        let statusFormatData = {
            "0": "已签合同",
            "1": "预收款",
            "2": "预收款已发货",
            "3": "已收款",
            "4": "已发货",
            "10": "已收货"
        };

        let statusFormat = function (value, column, row) {
            return statusFormatData[value];
        };

        let header = [{ name: "ord_contract", text: "合同编号" }, { name: "ord_time", text: "合同签订时间", format: "DateTimeFormat" }, { name: "cli_name", text: "客户" }, { name: "ord_fund", text: "金额" }, { name: "ord_status", text: "合同状态", format: statusFormat }, { name: "ops", text: "操作", format: btnFormat }];

        let statusData = [{ id: "0", text: "已签合同" }, { id: "1", text: "预收款" }, { id: "2", text: "预收款已发货" }, { id: "3", text: "已收款" }, { id: "4", text: "已发货" }, { id: "10", text: "已收货" }];

        return React.createElement(
            'div',
            { className: 'main-container' },
            React.createElement(MessageBox, { title: '提示', ref: 'confirm', type: 'confirm', confirm: this.confirmDelete }),
            React.createElement(MessageBox, { title: '提示', ref: 'tip', confirm: this.confirmDRefresh }),
            React.createElement(
                Dialog,
                { title: '已发货', ref: 'sendTip', grid: 0.3, onConfirm: this.sendResult },
                React.createElement(
                    'div',
                    { className: 'mt-20' },
                    React.createElement(
                        FormControl,
                        { label: '发货时间: ', className: 'flex vertical-center', ref: 'send_time', name: 'sendTime', required: true },
                        React.createElement(DateTime, { dateOnly: true, className: 'auto' })
                    ),
                    React.createElement(
                        FormControl,
                        { label: '发货单号: ', className: 'flex', ref: 'send_tracking', name: 'send_tracking', required: true },
                        React.createElement(Input, { className: 'auto' })
                    )
                )
            ),
            React.createElement(
                Dialog,
                { title: '已收货', ref: 'importTip', grid: 0.3, onConfirm: this.importResult },
                React.createElement(
                    'div',
                    { className: 'mt-20' },
                    React.createElement(FormControl, { label: '收货时间: ', ref: 'arrival_time', type: 'datetime', dateOnly: true, required: true })
                )
            ),
            React.createElement(
                Label,
                { className: 'searchTools mt-30 mb-20', component: 'div' },
                React.createElement(
                    Label,
                    { className: '', grid: 0.3 },
                    React.createElement(
                        Button,
                        { icon: 'plus', theme: 'success', href: '#export_add' },
                        '新增出库'
                    )
                ),
                React.createElement(
                    Label,
                    { className: 'text-right', grid: 0.7 },
                    React.createElement(FormControl, { ref: 'dateRange', label: '时间: ', type: 'daterange', endDate: moment() }),
                    React.createElement(FormControl, { ref: 'ord_contract', label: '合同号: ', type: 'text' }),
                    React.createElement(FormControl, { ref: 'ord_status', label: '状态: ', type: 'select', data: statusData, className: 'text-left',
                        placeholder: '选择合同状态', choiceText: '选择合同状态', hasEmptyOption: 'true' }),
                    React.createElement(FormControl, { ref: 'cli_name', label: '客户名称: ', type: 'text' }),
                    React.createElement(
                        Button,
                        { icon: 'search', theme: 'success', raised: true, className: 'ml-10', onClick: this.search },
                        '查 询'
                    )
                )
            ),
            React.createElement(
                Tile,
                { header: '出库列表', contentStyle: { padding: "0px" } },
                React.createElement(
                    'div',
                    { style: { overflow: 'hidden' } },
                    React.createElement(Table, { ref: 'table', header: header, data: [], striped: true, className: 'text-center' }),
                    React.createElement(Pagination, { ref: 'pagination',
                        current: this.pageNum,
                        pageSize: this.pageSize,
                        total: 0,
                        onChange: this.reloadTableData,
                        onShowSizeChange: this.reloadTableData })
                )
            )
        );
    }
});

module.exports = List;
