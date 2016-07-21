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

const ProviderService = require("../services/ProviderService");

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
            prov_name: this.refs.prov_name.getValue()
        });

        ProviderService.getPageList(params, (ret)=>{
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

    componentDidMount(){
        this.reloadTableData();
    },

    render(){
        let btnFormat = function(value, column, row){
            return (<span>
                <Button icon="edit" flat={true}>编辑</Button>
                <Button icon="trash" flat={true}>删除</Button>
            </span>);
        };
        let header = [
            {name: "prov_name", text: "名称"},
            {name: "prov_type", text: "产品类型"},
            {name: "prov_contactName", text: "联系人"},
            {name: "prov_phone", text: "联系电话"},
            {name: "prov_ctime", text: "创建时间", format: "DateTimeFormat"},
            {name: "prov_address", text: "地址"},
            {name: "ops", text: "操作", format: btnFormat}
        ];
        return (
            <div className="main-container">
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label className="" grid={0.3}>
                        <Button icon="plus" theme="success" href="#provider_add">新增供应商</Button>
                    </Label>

                    <Label className="text-right" grid={0.7}>
                        <FormControl ref="prov_name" label="供应商名称: " type="text"></FormControl>
                        <Button icon="search" theme="success" raised={true} className="ml-10" onClick={this.search}>查 询</Button>
                    </Label>
                </Label>

                <Tile header="供应商列表" contentStyle={{padding: "0px"}}>
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