const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;

const Tile = require('../Tile');
const Input = require('../lib/Input');
const Form = require('../lib/Form');
const FormControl = require('../lib/FormControl');
const Label = require('../lib/Label');
const Button = require('../lib/Button');

const ProviderService = require("../services/ProviderService");

let Page = React.createClass({

    submit(){
        let formItems = this.refs.form.getItems();
        let params = {
            prov_name: formItems["prov_name"].ref.getValue(),
            prov_address: formItems["prov_address"].ref.getValue(),
            prov_type: formItems["prov_type"].ref.getValue(),
            prov_phone: formItems["prov_phone"].ref.getValue(),
            prov_contactName: formItems["prov_contactName"].ref.getValue()
        };

        ProviderService.save(params, ()=>{

        });
    },

    render(){
        return (
            <div className="main-container">
                <Label className="searchTools mt-30 mb-20" component="div">
                    <h4>新增供应商</h4>
                </Label>

                <Tile header="供应商信息">
                    <Form ref="form" method="custom" layout="stack" submit={this.submit}>
                        <FormControl label="供应商名称: " type="text" name="prov_name" maxLength="75" grid={1} required></FormControl>
                        <FormControl label="供应商地址: " type="text" name="prov_address" maxLength="250" grid={1}></FormControl>
                        <FormControl label="产品类型: " type="text" name="prov_type" maxLength="75" grid={1}></FormControl>
                        <FormControl label="联系电话: " type="number" name="prov_phone" maxLength="18" grid={1}></FormControl>
                        <FormControl label="联系人: " type="text" name="prov_contactName" maxLength="10" grid={1}></FormControl>
                    </Form>
                </Tile>

            </div>
        );
    }
});

module.exports = Page;