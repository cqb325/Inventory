/**
 * Created by cqb32_000 on 2016-07-19.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');

let List = React.createClass({

    render(){
        return (
            <div className="container">
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Button icon="plus" theme="success">新增供应商</Button>
                </Label>

                <Tile header="供应商列表">

                </Tile>
            </div>
        );
    }
});

module.exports = List;