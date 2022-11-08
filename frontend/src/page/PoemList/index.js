import React, {useEffect, useState} from 'react'
import {
    redirect,
    useNavigate,

} from 'react-router-dom';
import {

    Box,
    Container, createTheme,

} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import axios from "axios";
import AsyncSelect from 'react-select/async';
import {logDOM} from "@testing-library/react";
import { useAuth } from "../../hooks/useAuth";
import {Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Table} from "antd";
import { Link } from 'react-router-dom';
import { useParams } from "react-router-dom";
let parentId;

const loadOptions = (inputValue, callback) => {
    console.log("loading children dropping bar")
    const params = {
        parentId: parentId,
    };
    // perform a request
    const requestResults =  axios.get("http://localhost:8888/getChildrenByParentId", { params })
        .then((response) => {
            const options = []
            response.data.forEach((child) => {
                options.push({
                    label: child.childName,
                    value: child.childId
                })
            })
            callback(options);
        })
}


const {Option} = Select;
const FormItem = Form.Item;

function PoemForm(props) {




    const onFinish = (values) => {
        console.log(values)
        console.log(props)

        // no props.value => add
        let data = values;
        if(!props.values) {
            data["childId"] = props.childId;

            props.handleAdd(data);
            props.onAddSubmit();
        } else {
            //  => update
            data["id"] = props.values.id;
            data["childId"] = props.values.childId;
            props.handleUpd(values);
            props.onUpdSubmit();
        }
    }

    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 18 },
    };

    const gutter = {
        xs: 8,
        sm: 16,
        md: 24,
        lg: 32,
    }

    return (
        <div>
            <Form
                {...layout}
                initialValues={props.values}
                style={{ width: 650 }}
                onFinish={ onFinish }>





                <Row gutter={gutter}>
                    <Col span={16}>
                        <FormItem
                            className="poemName"
                            label="poemName"
                            name="poemName"
                            rules={[
                                {
                                    required: true,
                                    message: "please enter poemName ",
                                }
                            ]}
                        >
                            <Input placeholder="poemName" allowClear />
                        </FormItem>
                    </Col>
                </Row>



                <FormItem>
                    <Button style={{ width: "650px" }} htmlType="submit" type="primary">
                        Submit
                    </Button>
                </FormItem>
            </Form>
        </div>
    )
}

 function PoemTable(props) {

    // define dataSource && some states
    const [dataSource, setDataSource] = useState([]);
    const [updVal, setUpdVal] = useState([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isUpdModalVisible, setIsUpdModalVisible] = useState(false);
    const [searchText, setSearchText] = useState(undefined);
    const [searchData, setSearchData] = useState([]);

    // utils
    const delFromArrayByItemElm = (arr, id) => {
        for(let i = 0; i < arr.length; i++) {
            if(arr[i].id === id) return i;
        }
    }

    /**
     *
     * @param {Array} arr
     * @param {Object} item
     * @returns
     */
    const updArrayByItem = (arr, item) => {
        let newArr = arr.map((arrItem) => {
            if(arrItem.id === item.id) { return item; }
            else { return arrItem; }
        });
        return newArr;
    }

    /**
     * Query by name
     * @param {string} key
     * @param {Array} arr
     */
    const fuzzyQuery = (arr, key) => {
        let fuzzyArr = [];
        arr.forEach(element => {
            if(element.name.indexOf(key) >= 0) {
                fuzzyArr.push(element);
            }
        });
        return fuzzyArr;
    }

    /**
     *
     * @param {Array} arr the arr need to be updated
     * @param {Object} item the item needed to be updated
     * @returns {Array} newArr the array has been updated
     */




    // index data
    useEffect(() => {
        const params = {
            childId: props.childId,
        };
        axios.get("http://localhost:8888/poemList/findByChildId",{ params })
            .then((rsp) => {
                setDataSource(rsp.data);
            })
            .catch((error) => {
                console.log(error)
            })
    }, [props.childId]);

    // CRUD -> D
    const handleDelete = (index) => {
        axios.delete('http://localhost:8888/poemList/deleteById/' + index.id)
            .then((rsp) => {
                let tmpData = [...dataSource];
                let i = delFromArrayByItemElm(tmpData ,index.id);
                tmpData.splice(i, 1);
                //  console.log(tmpData)
                setDataSource(tmpData)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    // CRUD -> C
    const handleAdd = (value) => {
        axios.post('http://localhost:8888/poemList/add/', value)
            .then((rsp) => {
                let tmpData = [...dataSource];
                tmpData.push(rsp.data);
                console.log(rsp.data);
                setDataSource(tmpData);
            })
            .catch((error) => {
                console.log(error)
            })
    }

    // CRUD -> U
    const handleUpd = (value) => {
        axios.put('http://localhost:8888/poemList/update/', value)
            .then((rsp) => {
                // replace  item in old dataSource
                let tmpData = updArrayByItem([...dataSource], value);
                setDataSource(tmpData);
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const onUpdClick = index => {
        // handle data format
        // index.department = [index.department]
        // index.joinDate = moment(index.joinDate, 'YYYY/MM')
        // index.gender = [index.gender];
        let data = index;
        // console.log("index data: ",index);
        setIsUpdModalVisible(true);
        setUpdVal(data);
    }

    // CRUD -> R
    const onSearch = value => {
        if(value) {
            setSearchText(value);
            let tmpData = fuzzyQuery(dataSource, value);
            setSearchData(tmpData);
        }
    }

    const onClickSearchItem = value => {
        let path = "/profile/" + value;
        props.history.push(path);
        setSearchData([]);
    }

    // table header
    const columns = [
        // {
        //     title: 'Avatar',
        //     dataIndex: 'avatar',
        //     key: 'avatar',
        //     render: (_,index) => {
        //         return(
        //             <Link to={`/profile/${index.id}`}>
        //                 <Avatar src={ index.avatar } />
        //             </Link>
        //         )
        //     }
        // },
        {
            title: 'poemId',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'poemName',
            dataIndex: 'poemName',
            key: 'poemName',
        },


        {
            title: 'Operation',
            dataIndex: 'operation',
            key: 'operation',
            render: (_,index) =>
                dataSource.length >= 1 ? (
                    <div className="del-update-container">
                        <Button size="small" type="primary" onClick={() => onUpdClick(index)}>Update</Button>
                        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(index)}>
                            <Button style={{ marginLeft: 5 }} size="small" danger type="primary">Delete</Button>
                        </Popconfirm>
                    </div>
                ) : null
        }
    ]

    const onAddSubmit = () => {
        setIsAddModalVisible(false)
    }

    const onUpdSubmit = () => {
        setIsUpdModalVisible(false)
    }

    return (
        <div className="teacher-list">

            <div className="add-search-container">
                <Button
                    type="primary"
                    onClick={() => setIsAddModalVisible(true)}
                >
                    Add a row
                </Button>
                <Select
                    style={{ width: 200 }}
                    placeholder="input search text"
                    showSearch
                    showArrow={false}
                    filterOption={false}
                    notFoundContent="nothing~🙄"
                    value = {searchText}
                    onSearch={onSearch}
                    onChange={onClickSearchItem}
                >
                    { searchData.map(d => (
                        <Option key={d.id}>{d.name}</Option>
                    ))
                    }
                </Select>
            </div>

            <Modal
                style={{ display: "flex", justifyContent: "center" }}
                destroyOnClose={true}
                title="Add a poemmmmmm"
                open={isAddModalVisible}
                footer={[]}
                onCancel={() => setIsAddModalVisible(false)}
            >
                <PoemForm childId={props.childId} handleAdd={handleAdd} onAddSubmit={onAddSubmit} />
            </Modal>

            <Modal
                style={{ display: "flex", justifyContent: "center" }}
                destroyOnClose={true}
                title="Update a feeding"
                open={isUpdModalVisible}
                footer={[]}
                onCancel={() => setIsUpdModalVisible(false)}
            >
                <PoemForm handleUpd={handleUpd} values={updVal} onUpdSubmit={onUpdSubmit} />
            </Modal>

            <Table
                columns={columns}
                rowKey={(record) => {
                    return record.id
                }}
                dataSource={dataSource}
                scroll={{ y: "470px" }}
            />
        </div>
    )
}
export default function PoemList() {

    const navigate = useNavigate();
    const { user,setUser } = useAuth();
    parentId=user["userId"];
    console.log("parentId",parentId)

    const [selectedOption, setSelectedOption]=useState(null);
    const [childId, setChildId]=useState(0);
    return (


            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                    }}
                >
                    <AsyncSelect cacheOptions
                                 value={selectedOption}
                                 onChange={newValue => {
                                     setSelectedOption(newValue)
                                     setChildId(newValue.value)
                                 }}
                                 loadOptions={loadOptions} defaultOptions />
                    <PoemTable  childId={childId}/>

                </Box>

            </Container>
    );

}