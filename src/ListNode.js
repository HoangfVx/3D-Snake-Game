export default class ListNode {
    
    next = null;
    prev = null;

    constructor(data){
        this.data = data;
    }

    linkTo(node){
        node.prev = this;
        this.next = node;
    }
}