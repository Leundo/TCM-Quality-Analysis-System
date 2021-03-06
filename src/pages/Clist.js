import React from 'react';
import { Redirect } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import './Clist.css';

import { setCtmplId } from '../slices/ctmplSlice';
import { Button, Layout, Menu, Modal, Space, notification } from 'antd';
import { apiGetFunctionList, apiAddFunction, apiDeleteFunction } from '../util/api';
import HomeSider from '../components/HomeSider';
import BankHeader from '../components/BankHeader';
import ClistTable from '../components/ClistTable';
import CompoundInput from '../components/CompoundInput';

const { Header, Content, Sider } = Layout;

export default function Clist(props) {
    const [redirect, setRedirect] = useState(null);
    const username = useSelector(state => state.global.username);
    const accessToken = useSelector(state => state.global.accessToken);
    const dispatch = useDispatch();

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    const [inputName, setInputName] = useState("");
    const [inputStandard, setInputStandard] = useState("");

    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 1000,
    });
    const [loading, setLoading] = useState(true);
    const [editRecord, setEditRecord] = useState(null);

    const [searchKey, setSearchKey] = useState("");
    const [sortOrder, setSortOrder] = useState("descend");
    const [sortField, setSortField] = useState("creation_time");

    const getFunctionList = (_pagination, _sortField, _sortOrder) => {
        return new Promise((resolve, reject) => {
            apiGetFunctionList(accessToken, (_pagination.current - 1) * _pagination.pageSize, _pagination.pageSize, _sortField, _sortOrder, searchKey).then((res) => {
                // console.log(res.data);
                let data = res.data;
                let newData = [];
                data.data.forEach(item => {
                    let date = new Date(item.creation_time);
                    let dateStr = date.getFullYear() + "-" + `${date.getMonth() + 1}`.padStart(2, '0') + "-" + `${date.getDate()}`.padStart(2, '0');
                    newData.push({
                        key: item.id,
                        id: item.id,
                        name: item.name,
                        addingTime: dateStr,
                        standard: item.standard,
                    });
                });
                setData(newData);
                setPagination(
                    {
                        ...pagination,
                        total: data.total
                    }
                );
                setLoading(false);
                resolve(newData);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    const updateCalculationList = () => {
        getFunctionList(pagination, sortField, sortOrder).then((res) => {

        }).catch((err) => {
            console.log(err);
        });
    }

    useEffect(() => {
        updateCalculationList();
    }, []);

    // -- BEGIN -- HomeSider??????

    const handleMenuItemClick = (idx, e) => {
        if (idx === '0') {
            setRedirect("/me");
        } else if (idx === '1') {
            setRedirect("/home");
        } else if (idx === '2') {
            setRedirect("/bank");
        }
    }

    // -- END -- HomeSider??????

    // -- BEGIN -- ClistTable??????

    const onEditClick = (record) => {
        dispatch(setCtmplId(record.id));
        setRedirect("/ctmpl");
    }

    const onDeleteClick = (record) => {
        apiDeleteFunction(accessToken, record.id).then((res) => {
            setLoading(true);
            updateCalculationList();
        }).catch((err) => {
            console.log(err);
            notification.open({
                message: "????????????",
            });
        });
    }

    const onTableChange = (pagination, filters, sorter) => {
        let sort_by_field = sorter.field;
        if (sort_by_field === "name") {
            sort_by_field = "name";
            setSortField("name");
        } else if (sort_by_field === "addingTime") {
            sort_by_field = "creation_time";
            setSortField("creation_time");
        }
        setSortOrder(sorter.order);

        getFunctionList(pagination, sort_by_field, sorter.order).then((res) => {

        }).catch((err) => {
            console.log(err);
        });

    };

    // -- END -- ClistTable??????

    // -- BEGIN -- AddModal??????

    const onAddCalculationOK = () => {
        if (inputName === "" || inputStandard === "") {
            notification.open({
                message: "???????????????",
                description: "?????????????????????????????????",
            });
        } else {
            
            apiAddFunction(accessToken, inputName, inputStandard).then((res) => {
                console.log(res);
                setLoading(true);
                updateCalculationList();
            }).catch((err) => {
                console.log(err);
            });
            
            setIsAddModalVisible(false);
        }
    }

    const onAddCalculationCancel = () => {
        setIsAddModalVisible(false);
    }

    const onAddClick = (e) => {
        setIsAddModalVisible(true);
    }

    const onAddRecordInputChange = (e, tag) => {
        if (tag === "name") {
            setInputName(e.target.value);
        } else if (tag === "standard") {
            setInputStandard(e.target.value);
        }
    }


    // -- END -- AddModal??????

    const onSearch = (value) => {
        setSearchKey(value);
    }

    if (redirect !== null) {
        return (
            <Redirect push to={redirect} />
        );
    }

    return (
        <Layout
            className="mp-home-layout"
        >
            <HomeSider
                defaultSelectedKey='3'
                isAdministrator={true}
                handleMenuItemClick={handleMenuItemClick}
            />

            <Content
                className="site-layout-background"
                style={{
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                }}
            >
                <BankHeader
                    onAddClick={onAddClick}
                    onSearch={onSearch}
                />

                <ClistTable
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onTableChange={onTableChange}
                    data={data}
                    pagination={pagination}
                    loading={loading}
                />

                <Modal
                    title="????????????"
                    visible={isAddModalVisible}
                    onOk={onAddCalculationOK}
                    onCancel={onAddCalculationCancel}
                    okText="??????"
                    cancelText="??????"
                >
                    <Space className="mp-vlist" direction="vertical" size={'small'}>
                        <CompoundInput
                            isSwitchHidden={true}
                            fieldName="????????????"
                            text={inputName}
                            isRequired={true}
                            textWidth={200}
                            maxLength={30}

                            onInputChange={(e) => onAddRecordInputChange(e, "name")}
                        />
                        <CompoundInput
                            isSwitchHidden={true}
                            fieldName="????????????"
                            text={inputStandard}
                            isRequired={true}
                            textWidth={200}
                            maxLength={30}

                            onInputChange={(e) => onAddRecordInputChange(e, "standard")}
                        />
                    </Space>
                </Modal>

            </Content>

        </Layout>
    );
}
