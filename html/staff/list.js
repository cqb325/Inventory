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
const Upload = require('../lib/Upload');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');

const StaffService = require("../services/StaffService");
const reader = require('excel-data');

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
            staff_name: this.refs.staff_name.getValue()
        });

        StaffService.getPageList(params, ret => {
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
        this.refs.confirm.show("确认删除该员工？");
        this.refs.confirm.setData(id);
    },

    confirmDelete(flag) {
        if (flag) {
            var id = this.refs.confirm.getData();
            StaffService.deleteById(id, ret => {
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

    choiceFile(value, file) {
        let path = file.files[0].path;
        reader.read(path).then(data => {
            for (let sheetName in data) {
                let sheetData = data[sheetName];
                this.saveStaffs(sheetData);
            }
        });
    },

    saveStaffs(sheetData) {
        console.log(sheetData);
        let data = sheetData.data;
        StaffService.importData(data, ret => {
            if (ret) {
                this.refs.tip.show("导入成功");
                this.refs.tip.setData(true);
            } else {
                this.refs.tip.show("导入失败");
                this.refs.tip.setData(false);
            }
        });
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
                    { theme: 'success', className: 'ml-10', icon: 'edit', flat: true, href: "#staff_edit/" + row.staff_id },
                    '编辑'
                ),
                React.createElement(
                    Button,
                    { theme: 'success', className: 'ml-10', icon: 'trash', flat: true, onClick: scope.showConfirm.bind(scope, row.staff_id) },
                    '删除'
                )
            );
        };
        let header = [{ name: "staff_name", text: "名称" }, { name: "staff_phone", text: "手机号" }, { name: "ops", text: "操作", format: btnFormat }];
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
                        { icon: 'plus', theme: 'success', href: "#staff_add" },
                        '新增员工'
                    ),
                    React.createElement(Upload, { onChange: this.choiceFile, placeHolder: '选择excel文件批量导入', className: 'ml-10', style: { top: "11px" } })
                ),
                React.createElement(
                    Label,
                    { className: 'text-right', grid: 0.7 },
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
                { header: '员工列表', contentStyle: { padding: "0px" } },
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
