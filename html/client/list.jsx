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
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const FontIcon = require('../lib/FontIcon');

const ClientService = require("../services/ClientService");

let List = React.createClass({

    getInitialState(){
        this.pageNum = 1;
        this.pageSize = 15;
        return {};
    },

    reloadTableData(pageNum, pageSize){
        let params = Object.assign({},{
            pageNum: pageNum,
            pageSize: pageSize,
            cli_name: this.refs.cli_name.getValue()
        });

        ClientService.getPageList(params, (ret)=>{
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

    search(){
        this.reloadTableData(this.pageNum, this.pageSize);
    },

    showConfirm(id){
        this.refs.confirm.show("确认删除该客户？");
        this.refs.confirm.setData(id);
    },

    confirmDelete(flag){
        if(flag) {
            var id = this.refs.confirm.getData();
            ClientService.deleteById(id, (ret)=>{
                if(ret){
                    this.refs.tip.show("删除成功");
                    this.refs.tip.setData(true);
                }else{
                    this.refs.tip.show("删除失败");
                    this.refs.tip.setData(false);
                }
            });

            return true;
        }
    },

    confirmDRefresh(){
        if(this.refs.tip.getData()){
            this.search();
        }
    },

    componentDidMount(){
        this.reloadTableData();
    },

    render(){
        let scope = this;
        let btnFormat = function(value, column, row){
            return (<span>
                <Button theme="success" className="ml-10" icon="edit" flat={true} href={"#client_edit/"+row.cli_id}>编辑</Button>
                <Button theme="success" className="ml-10" icon="trash" flat={true} onClick={scope.showConfirm.bind(scope, row.cli_id)}>删除</Button>
            </span>);
        };
        let header = [
            {name: "cli_name", text: "名称", tip: true},
            {name: "cli_contact", text: "联系人"},
            {name: "cli_phone", text: "联系电话"},
            {name: "dist_mergername", text: "区域"},
            {name: "cli_address", text: "地址", tip: true},
            {name: "ops", text: "操作", format: btnFormat}
        ];
        return (
            <div className="main-container">
                <MessageBox title="提示" ref="confirm" type="confirm" confirm={this.confirmDelete}/>
                <MessageBox title="提示" ref="tip" confirm={this.confirmDRefresh}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label className="" grid={0.3}>
                        <Button icon="plus" theme="success" href="#client_add">新增客户</Button>
                    </Label>

                    <Label className="text-right" grid={0.7}>
                        <FormControl ref="cli_name" label="客户: " type="text"></FormControl>
                        <Button icon="search" theme="success" raised={true} className="ml-10" onClick={this.search}>查 询</Button>
                    </Label>
                </Label>

                <Tile header={<span><FontIcon icon="list" style={{color: "#EA8010" }}/> 客户列表</span>} contentStyle={{padding: "0px"}}>
                    <div style={{overflow: 'hidden'}}>
                        <Table ref="table" header={header} data={[]} striped={true} className="text-center"/>
                        <Pagination ref="pagination"
                                    current={this.pageNum}
                                    pageSize={this.pageSize}
                                    total={0}
                                    onChange={this.reloadTableData}
                                    onShowSizeChange={this.reloadTableData}/>
                    </div>
                </Tile>
            </div>
        );
    }
});

module.exports = List;