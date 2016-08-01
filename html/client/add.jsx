const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;

const Tile = require('../Tile');
const Input = require('../lib/Input');
const ComboTree = require('../lib/ComboTree');
const Form = require('../lib/Form');
const FormControl = require('../lib/FormControl');
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const MessageBox = require('../lib/MessageBox');

const ClientService = require("../services/ClientService");
const DistrictService = require("../services/DistrictService");

let Page = React.createClass({

    submit(){
        let formItems = this.refs.form.getItems();
        let params = {
            cli_name: formItems["cli_name"].ref.getValue(),
            cli_address: formItems["cli_address"].ref.getValue(),
            cli_phone: formItems["cli_phone"].ref.getValue(),
            cli_areaid: formItems["cli_areaid"].ref.getValue(),
            cli_contact: formItems["cli_contact"].ref.getValue()
        };

        ClientService.save(params, (ret)=>{
            if(ret){
                this.refs.tip.show("保存成功");
                this.refs.tip.setData(true);
            }else{
                this.refs.tip.show("保存失败");
                this.refs.tip.setData(false);
            }
        });
    },

    confirm(){
        if(this.refs.tip.getData()){
            window.location.href = "#ClientList";
        }
    },

    getDistrictByParentId(parentid, callback){
        DistrictService.getChildrenByParentId(parentid, (district)=>{
            callback(district);
        });
    },

    componentDidMount(){
        var comboTree = this.refs.comboTree.item;
        var tree = comboTree.getReference();

        tree.on("open", (item)=>{
            if(item.open) {
                tree.deleteChildItems(item);
                this.getDistrictByParentId(item.id, (items)=>{
                    tree.loadDynamicJSON(item, items);
                });
            }
        });
    },

    render(){
        let treeData = [{
            id: "100000",
            text: "中国"
        }];
        return (
            <div className="main-container">
                <MessageBox title="提示" ref="tip" confirm={this.confirm}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label grid={0.3}>
                        <h4>新增客户</h4>
                    </Label>
                    <Label grid={0.7} className="text-right">
                        <Button icon="mail-reply" theme="info" raised={true} href="javascript:history.go(-1)">返 回</Button>
                    </Label>
                </Label>

                <Tile header="客户信息">
                    <Form ref="form" method="custom" layout="stack" submit={this.submit}>
                        <FormControl label="客户名称: " type="text" name="cli_name" maxLength="75" grid={1} required></FormControl>
                        <FormControl label="客户区县: " ref="comboTree" data={treeData} type="combotree" name="cli_areaid" grid={1} required></FormControl>
                        <FormControl label="客户地址: " type="text" name="cli_address" maxLength="250" grid={1}></FormControl>
                        <FormControl label="联系电话: " type="number" name="cli_phone" maxLength="18" grid={1}></FormControl>
                        <FormControl label="联系人: " type="text" name="cli_contact" maxLength="10" grid={1}></FormControl>
                    </Form>
                </Tile>

            </div>
        );
    }
});

module.exports = Page;