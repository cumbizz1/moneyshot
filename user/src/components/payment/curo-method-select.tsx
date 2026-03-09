import { Select } from 'antd';

interface IProps {
  method?: string;
  onChange: Function;
};

function CuroMethodSelect({
  method = 'creditcard',
  onChange
}) {
  return (
    <div>
      <label>Select your method </label>
      <Select className="payment-dropdown" onChange={onChange} value={method}>
        <Select.Option value="bancontact" className="payment-item">
          <img src="/bancontact.svg" alt="" style={{width: '50px', height: '25px'}} />
          <span>Bancontact</span>
        </Select.Option>
        <Select.Option value="creditcard" className="payment-item">
          <img src="/creditcard.svg" alt="" style={{width: '50px', height: '25px'}} />
          <span>Credit card</span>
        </Select.Option>
        <Select.Option value="ideal" className="payment-item">
          <img src="/ideal.svg" alt="" style={{width: '50px', height: '25px'}} />
          <span>iDEAL</span>
        </Select.Option>
        <Select.Option value="sofortbanking" className="payment-item">
          <img src="/sofortbanking.svg" alt="" style={{width: '50px', height: '25px'}} />
          <span>SOFORTbanking</span>
        </Select.Option>
        <Select.Option value="banktransfer" className="payment-item">
          <img src="/banktransfer.svg" alt="" style={{width: '50px', height: '25px'}} />
          <span>Bank transfer</span>
        </Select.Option>
        <Select.Option value="bitcoin" className="payment-item">
          <img src="/bitcoin.svg" alt="" style={{width: '50px', height: '25px'}} />
          <span>Bitcoin</span>
        </Select.Option>
        <Select.Option value="giropay" className="payment-item">
          <img src="/giropay.svg" alt="" style={{width: '50px', height: '25px'}} />
          <span>Giropay</span>
        </Select.Option>
        <Select.Option value="onlineueberweisen" className="payment-item">
          <img src="/onlineueberweisen.svg" alt="" style={{width: '50px', height: '25px'}} />
          <span>OnlineÜberweisen</span>
        </Select.Option>
        <Select.Option value="paysafecard" className="payment-item">
          <img src="/paysafecard.svg" alt="" style={{width: '50px', height: '25px'}} />
          <span>Paysafecard</span>
        </Select.Option>
      </Select>
    </div>
  );
}

export default CuroMethodSelect;