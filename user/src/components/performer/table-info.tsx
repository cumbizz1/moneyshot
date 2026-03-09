import { getDiffYear } from '@lib/date';
import { utilsService } from '@services/utils.service';
import {
  Collapse,
  Descriptions, Tag
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { ICountry, IPerformer } from 'src/interfaces';

interface IProps {
  performer: IPerformer;
  countries: ICountry[];
}

export function PerformerInfo({
  performer,
  countries = []
}: IProps) {
  const [bodyInfo, setBodyInfo] = useState(null);
  const country = useMemo(() => countries.length && countries.find((c) => c.name === performer?.country || c.code === performer?.country), [performer, countries]);

  const loadInfo = async () => {
    const res = await utilsService.bodyInfo();
    setBodyInfo(res.data);
  };

  const findVal = (key, val) => {
    if (!bodyInfo || !bodyInfo[key]) return '...';

    const f = bodyInfo[key].find((i) => i.value === val);
    if (!f) return '...';
    return f.text;
  };

  useEffect(() => {
    loadInfo();
  }, []);

  return (
    <div className="per-infor">
      <Collapse defaultActiveKey={['1']} bordered={false} accordion>
        <Collapse.Panel
          header={country ? (
            <>
              <img alt="performer-country" src={country?.flag} height="25px" />
              &nbsp;
              {country?.name}
            </>
          ) : 'About me'}
          key="1"
        >
          <div className="bio">{performer?.bio || ''}</div>
          {performer?.languages && performer?.languages.length > 0 && (
            <Descriptions>
              <Descriptions.Item label="Languages">
                {performer?.languages.map((lang) => <Tag key={lang}>{lang}</Tag>)}
              </Descriptions.Item>
            </Descriptions>
          )}
          <Descriptions>
            {performer?.dateOfBirth && (
              <Descriptions.Item label="Age">
                {getDiffYear(performer?.dateOfBirth) ? `${getDiffYear(performer?.dateOfBirth)}+` : 'N/A'}
              </Descriptions.Item>
            )}
            {performer?.gender && (
              <Descriptions.Item label="Gender">
                {findVal('genders', performer.gender)}
              </Descriptions.Item>
            )}
            {performer?.sexualOrientation && (
              <Descriptions.Item label="Sexual Orientation">{findVal('sexualOrientations', performer.sexualOrientation)}</Descriptions.Item>
            )}
            {performer?.ethnicity && (
              <Descriptions.Item label="Ethnicity">
                {findVal('ethnicities', performer.ethnicity)}
              </Descriptions.Item>
            )}
            {performer?.height && <Descriptions.Item label="Height">{findVal('heights', performer.height)}</Descriptions.Item>}
            {performer?.weight && <Descriptions.Item label="Weight">{findVal('weights', performer.weight)}</Descriptions.Item>}
            {performer?.eyes && <Descriptions.Item label="Eyes color">{findVal('eyes', performer.eyes)}</Descriptions.Item>}
            {performer?.butt && <Descriptions.Item label="Butt size">{findVal('butts', performer.butt)}</Descriptions.Item>}
            {performer?.hair && <Descriptions.Item label="Hair color">{findVal('hairs', performer.hair)}</Descriptions.Item>}
            {performer?.pubicHair && <Descriptions.Item label="Pubic hair">{findVal('pubicHairs', performer.pubicHair)}</Descriptions.Item>}
            {performer?.bodyType && <Descriptions.Item label="Body type">{findVal('bodyTypes', performer.bodyType)}</Descriptions.Item>}
            {performer?.state && <Descriptions.Item label="State">{performer?.state}</Descriptions.Item>}
            {performer?.city && <Descriptions.Item label="City">{performer?.city}</Descriptions.Item>}
            {performer?.address && <Descriptions.Item label="Address">{performer?.address}</Descriptions.Item>}
            {performer?.zipcode && <Descriptions.Item label="Zip code">{performer?.zipcode}</Descriptions.Item>}
          </Descriptions>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}
