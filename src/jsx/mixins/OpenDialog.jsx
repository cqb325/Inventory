module.exports = {

    componentDidUpdate: function () {
        for(let key in this.refs){
            let ref = this.refs[key];
            if(ref.refs && ref.props["data-toggle"] == "dialog"){
                let listener = ()=>{
                    let target = ref.props["data-target"];
                    let targetRef = this.refs[target];
                    if(targetRef.open){
                        targetRef.open();
                        return ;
                    }
                };
                ref.un("click", listener);
                ref.on("click", listener);
            }
        }
    }
};