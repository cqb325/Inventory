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

const ProductService = require("../services/ProductService");

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
            prod_name: this.refs.prod_name.getValue(),
            prov_id: this.props.params.id
        });

        ProductService.getPageList(params, (ret)=>{
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
        this.refs.confirm.show("确认删除该产品？");
        this.refs.confirm.setData(id);
    },

    confirmDelete(flag){
        if(flag) {
            var id = this.refs.confirm.getData();
            ProductService.deleteById(id, (ret)=>{
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
                <Button icon="edit" flat={true} href={"#product_edit/"+row.prod_id}>编辑</Button>
                <Button icon="trash" flat={true} onClick={scope.showConfirm.bind(scope, row.prod_id)}>删除</Button>
            </span>);
        };
        let header = [
            {name: "prod_name", text: "名称"},
            {name: "prod_price", text: "单价"},
            {name: "prod_brand", text: "品牌"},
            {name: "prod_type", text: "类型"},
            {name: "prod_model", text: "型号"},
            {name: "prod_specifications", text: "规格"},
            {name: "ops", text: "操作", format: btnFormat}
        ];
        return (
            <div className="main-container">
                <MessageBox title="提示" ref="confirm" type="confirm" confirm={this.confirmDelete}/>
                <MessageBox title="提示" ref="tip" confirm={this.confirmDRefresh}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label className="" grid={0.3}>
                        <Button icon="plus" theme="success" href={"#product_add/"+this.props.params.id }>新增产品</Button>
                    </Label>

                    <Label className="text-right" grid={0.7}>
                        <FormControl ref="prod_name" label="产品名称: " type="text"></FormControl>
                        <Button icon="search" theme="success" raised={true} className="ml-10" onClick={this.search}>查 询</Button>
                        <Button className="ml-20" icon="mail-reply" theme="info" raised={true} href="javascript:history.go(-1)">返 回</Button>
                    </Label>
                </Label>

                <Tile header="产品列表" contentStyle={{padding: "0px"}}>
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