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
const Pagination = require('../lib/Pagination');
const Input = require('../lib/Input');
const Select = require('../lib/Select');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');

const ImportService = require("../services/ImportService");

let List = React.createClass({
    displayName: 'List',


    getInitialState() {
        this.pageNum = 1;
        this.pageSize = 15;
        return {};
    },

    reloadTableData(pageNum, pageSize) {
        let params = Object.assign({}, {
            pageNum: pageNum,
            pageSize: pageSize,
            prov_name: this.refs.prov_name.getValue()
        });

        ImportService.getPageList(params, ret => {
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
        this.refs.confirm.show("确认删除该供应商？");
        this.refs.confirm.setData(id);
    },

    confirmDelete(flag) {
        if (flag) {
            var id = this.refs.confirm.getData();
            ProviderService.deleteById(id, ret => {
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

    render() {
        let scope = this;
        let btnFormat = function (value, column, row) {
            return React.createElement(
                'span',
                null,
                React.createElement(
                    Button,
                    { theme: 'success', className: 'ml-10', icon: 'edit', flat: true, href: "#provider_edit/" + row.prov_id },
                    '编辑'
                ),
                React.createElement(
                    Button,
                    { theme: 'success', className: 'ml-10', icon: 'trash', flat: true,
                        onClick: scope.showConfirm.bind(scope, row.prov_id) },
                    '删除'
                )
            );
        };

        let statusFormatData = {
            "0": "已签合同",
            "1": "预付款未发货",
            "2": "预付款已发货",
            "3": "已付款",
            "4": "已发货",
            "10": "已入库"
        };

        let statusFormat = function (value, column, row) {
            return statusFormatData[value];
        };

        let header = [{ name: "ord_contract", text: "合同编号" }, { name: "ord_time", text: "合同签订时间" }, { name: "prov_name", text: "供应商" }, { name: "ord_fund", text: "金额" }, { name: "ord_status", text: "合同状态", format: statusFormat }, { name: "ops", text: "操作", format: btnFormat }];

        let statusData = [{ id: "0", text: "已签合同" }, { id: "1", text: "预付款未发货" }, { id: "2", text: "预付款已发货" }, { id: "3", text: "已付款" }, { id: "4", text: "已发货" }, { id: "10", text: "已入库" }];

        return React.createElement(
            'div',
            { className: 'main-container' },
            React.createElement(MessageBox, { title: '提示', ref: 'confirm', type: 'confirm', confirm: this.confirmDelete }),
            React.createElement(MessageBox, { title: '提示', ref: 'tip', confirm: this.confirmDRefresh }),
            React.createElement(
                Label,
                { className: 'searchTools mt-30 mb-20', component: 'div' },
                React.createElement(
                    Label,
                    { className: '', grid: 0.3 },
                    React.createElement(
                        Button,
                        { icon: 'plus', theme: 'success', href: '#import_add' },
                        '新增入库'
                    )
                ),
                React.createElement(
                    Label,
                    { className: 'text-right', grid: 0.7 },
                    React.createElement(FormControl, { ref: 'ord_contract', label: '合同号: ', type: 'text' }),
                    React.createElement(FormControl, { ref: 'prov_name', label: '状态: ', type: 'select', data: statusData, className: 'text-left',
                        placeholder: '选择合同状态', choiceText: '选择合同状态', hasEmptyOption: 'true' }),
                    React.createElement(FormControl, { ref: 'prov_name', label: '供应商名称: ', type: 'text' }),
                    React.createElement(
                        Button,
                        { icon: 'search', theme: 'success', raised: true, className: 'ml-10', onClick: this.search },
                        '查 询'
                    )
                )
            ),
            React.createElement(
                Tile,
                { header: '供应商列表', contentStyle: { padding: "0px" } },
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
