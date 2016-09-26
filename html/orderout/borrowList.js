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
            staff_name: this.refs.staff_name.getValue(),
            startDate: dateRange[0],
            endDate: dateRange[1]
        });

        ExportService.getInnerBorrowPageList(params, ret => {
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

    sendResult(flag) {
        let ord_no = this.refs.sendTip.getData();
        if (flag) {
            let isValida = this.refs.send_time.check();
            if (isValida) {
                let sendTime = this.refs.send_time.getValue();
                ExportService.setStatus(ord_no, Format.ORDER_STATUS.SEND, sendTime, ret => {
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

            let sendBtn = React.createElement(
                Button,
                { key: '3', theme: 'success', className: 'ml-10', icon: 'cc-visa', flat: true, onClick: scope.sendConfirm.bind(scope, row.ord_no) },
                '出货时间'
            );
            let detailBtn = React.createElement(
                Button,
                { key: '5', theme: 'success', className: 'ml-10', icon: 'bars', flat: true, href: "#export_payFund/" + row.ord_no + "/" + Format.ORDER_TYPE.INNER_BORROW },
                '查看'
            );
            if (row.ord_status == Format.ORDER_STATUS.FUNDED) {
                btns.push(sendBtn);
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

        let StatusFormat = function (value, column, row) {
            if (row.ord_contract) {
                return "已归还";
            } else {
                return "借用中";
            }
        };

        let header = [{ name: "staff_name", text: "借用员工" }, { name: "ord_time", text: "借用时间", format: "DateTimeFormat" }, { name: "status", text: "状态", format: StatusFormat }, { name: "ops", text: "操作", format: btnFormat }];

        return React.createElement(
            'div',
            { className: 'main-container' },
            React.createElement(MessageBox, { title: '提示', ref: 'confirm', type: 'confirm', confirm: this.confirmDelete }),
            React.createElement(MessageBox, { title: '提示', ref: 'tip', confirm: this.confirmDRefresh }),
            React.createElement(
                Dialog,
                { title: '已出货', ref: 'sendTip', grid: 0.3, onConfirm: this.sendResult },
                React.createElement(
                    'div',
                    { className: 'mt-20' },
                    React.createElement(
                        FormControl,
                        { label: '出货时间: ', className: 'flex vertical-center', ref: 'send_time', name: 'sendTime', required: true },
                        React.createElement(DateTime, { dateOnly: true, className: 'auto' })
                    )
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
                        { icon: 'plus', theme: 'success', className: 'ml-10', href: '#export_borrow' },
                        '内部产品借用'
                    )
                ),
                React.createElement(
                    Label,
                    { className: 'text-right', grid: 0.7 },
                    React.createElement(FormControl, { ref: 'dateRange', label: '时间: ', type: 'daterange', endDate: moment() }),
                    React.createElement(FormControl, { ref: 'staff_name', label: '员工名称: ', type: 'text' }),
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
