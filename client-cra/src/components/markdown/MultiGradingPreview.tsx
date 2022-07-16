import { Box, Tab, TabProps, Tabs, TabsProps } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import { ITeamMarkdownData } from 'shared/model/Markdown';
import TabPanel from '../TabPanel';
import Markdown from './Markdown';

interface TabData extends TabProps {
  label: string;
  content: React.ReactNode;
}

interface TabsWrapperProps {
  tabs: TabData[];
  TabsProps?: Omit<TabsProps, 'value' | 'onChange'>;
}

interface Props {
  data: ITeamMarkdownData[];
  TabsProps?: TabsWrapperProps['TabsProps'];
}

function TabsWrapper({ tabs, TabsProps }: TabsWrapperProps): JSX.Element {
  const [selectedTab, setSelectedTab] = useState(0);
  const { panels, tabElements } = useMemo(() => {
    const tabElements: JSX.Element[] = [];
    const panels: JSX.Element[] = [];

    tabs.forEach(({ content, ...tabProps }, idx) => {
      tabElements.push(<Tab key={tabProps.label} value={idx} {...tabProps} />);
      panels.push(
        <TabPanel key={tabProps.label} value={idx} index={selectedTab}>
          {content}
        </TabPanel>
      );
    });

    return { tabElements, panels };
  }, [tabs, selectedTab]);

  const handleChange = (_: React.ChangeEvent<unknown>, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <Tabs {...TabsProps} value={selectedTab} onChange={handleChange}>
        {tabElements}
      </Tabs>

      {panels}
    </>
  );
}

function MultiGradingPreviewWithTabs({ data, TabsProps }: Props): JSX.Element {
  const tabs: TabData[] = useMemo(
    () =>
      data.map(({ teamName, html, belongsToTeam }) => ({
        label: belongsToTeam ? `Team ${teamName}` : `Student/in ${teamName}`,
        content: <Markdown html={html} />,
      })),
    [data]
  );

  return <TabsWrapper tabs={tabs} TabsProps={TabsProps} />;
}

function MultiGradingPreview(props: Props): JSX.Element {
  const { data } = props;
  let content: React.ReactNode;

  if (data.length <= 1) {
    content = <Markdown html={data[0]?.html ?? ''} />;
  } else {
    content = <MultiGradingPreviewWithTabs {...props} />;
  }

  return <Box>{content}</Box>;
}

export default MultiGradingPreview;
