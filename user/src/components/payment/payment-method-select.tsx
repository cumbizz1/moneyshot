import { Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import CuroMethodSelect from './curo-method-select';

function PaymentMethodSelect({
  ccbillEnabled,
  curoEnabled,
  showModal = false,
  onSelect,
  onCancel
}) {
  const [paymentGateway, setGateway] = useState('');
  const [curoMethod, setMethod] = useState('creditcard');

  const onOK = () => {
    onSelect({
      paymentGateway,
      curoMethod
    });
  };

  useEffect(() => {
    if (ccbillEnabled) setGateway('ccbill');
    else if (curoEnabled) setGateway('curo');
  }, []);

  if (!showModal) return null;

  return (
    <Modal title="Select payment method" visible onOk={onOK} onCancel={onCancel}>
      <Radio.Group onChange={(e) => setGateway(e.target.value)} value={paymentGateway}>
        {ccbillEnabled && (
          <Radio value="ccbill">
            <img alt="CCBill" src="/ccbill-ico.png" style={{ width: '50px', height: 'auto' }} />
          </Radio>
        )}
        {curoEnabled && (
          <Radio value="curo">
            <img alt="CURO" src="/curo-icon.jpg" style={{ width: '50px', height: 'auto' }} />
          </Radio>
        )}
      </Radio.Group>

      {paymentGateway === 'curo' && <>
        <hr />
        <CuroMethodSelect
          method={curoMethod}
          onChange={(method) => setMethod(method)}
        />
      </>}
    </Modal>
  );
}

const mapStates = (state: any) => {
  return {
    ccbillEnabled: state.settings.ccbillEnable,
    curoEnabled: state.settings.curoEnabled
  };
};

export default connect(mapStates)(PaymentMethodSelect);