import {SnsNotificationRepository} from '../redhat-acs-sns-repository'

describe('SNS Notification Repository', () => {
    describe('unit', () => {
        it('should set a topic Arn', () => {
            const notification = new SnsNotificationRepository('test')
            expect(notification.topicArn).toBe('test')
        })

        it('should set an SNS library', () => {
            const snsMock = {
                publish: jest.fn(),
            }
            const notification = new SnsNotificationRepository('test', snsMock)
            expect(notification.sns).toBe(snsMock)
        })

        it('should publish a message', async () => {
            const snsMock = {
                publish: jest.fn().mockReturnValue({promise: () => Promise.resolve()}),
            }
            const notification = new SnsNotificationRepository('testTopic', snsMock)
            await notification.send('{\n' +
                '  "Type" : "Notification",\n' +
                '  "MessageId" : "988030bd-6710-523a-9ac4-6df17ec23ac6",\n' +
                '  "TopicArn" : "arn:aws:sns:us-east-1:551226696698:ossdev-Acs-event",\n' +
                '  "Message" : "[{\\"eventId\\":\\"2f8a2d90-91d9-48a4-97f9-b7cc95f1d318\\",\\"eventName\\":\\"Required Label: Owner/Team\\",\\"eventCategory\\":\\"acs\\",\\"eventCategoryName\\":\\"ACS\\",\\"eventSource\\":\\"redhat\\",\\"eventSourceName\\":\\"Red Hat\\",\\"latest\\":\\"true\\",\\"payload\\":{\\"id\\":\\"2f8a2d90-91d9-48a4-97f9-b7cc95f1d318\\",\\"severity\\":\\"LOW_SEVERITY\\",\\"description\\":\\"Alert on deployments missing the \'owner\' or \'team\' label\\",\\"clusterName\\":\\"acs-pc-demo\\",\\"namespace\\":\\"openshift-marketplace\\",\\"goToViolation\\":\\"https://acs-cgcv4rlkik9vj0kg0rk0.acs.rhcloud.com/main/violations/2f8a2d90-91d9-48a4-97f9-b7cc95f1d318\\",\\"lastUpdated\\":\\"2023-08-08T08:06:40.730808462Z\\"}}]",\n' +
                '  "Timestamp" : "2023-08-08T10:23:14.427Z",\n' +
                '  "SignatureVersion" : "1",\n' +
                '  "Signature" : "VOHzZ1XJ6+YC/dyhZ0lWLJ+jx/pBkrIrzpFQ4Rndd4qe5IymZr61gTLxZ5Rj5T7w8eXl4ukpPScTYtkY6m8xYaNLG8qZnq9mOGvQRSCzzgiWa++4raTQMPeFVUQCh0cPRpyx6TkYVOwlA1nAG+/v1F+i+donc8A9l4d/jBE7NpO2TIMxDXs49SYWDioqzpnA5j5LXhK4eEo+RMIj/aDURkSPN/GH356nRfzIOFdxPNx0xxYRw9qTeuBrX4HT5tyHykyAiQIk2i//glBAT8Kc6WtNSDtRq6GN43Tc9pbjI8n3lwFi4pAKERWvNfh1w5SpTfQv5FgnDC8u/1GtRYJZ4w==",\n' +
                '  "SigningCertURL" : "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-01d088a6f77103d0fe307c0069e40ed6.pem",\n' +
                '  "UnsubscribeURL" : "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:551226696698:ossdev-Acs-event:035d9ff9-c18c-435e-b0f5-d06145da8e95"\n' +
                '}')
            expect(snsMock.publish).toHaveBeenCalledTimes(1)
            expect(snsMock.publish).toHaveBeenCalledWith({
                Message: '"test"',
                TopicArn: 'testTopic',
            })
        })

        it('should stringify an object when send as a message', async () => {
            const snsMock = {
                publish: jest.fn().mockReturnValue({promise: () => Promise.resolve()}),
            }
            const notification = new SnsNotificationRepository('testTopic', snsMock)
            await notification.send({test: true})
            expect(snsMock.publish).toHaveBeenCalledTimes(1)
            expect(snsMock.publish).toHaveBeenCalledWith({
                Message: '{"test":true}',
                TopicArn: 'testTopic',
            })
        })

        it('should send a message with message attributes', async () => {
            const snsMock = {
                publish: jest.fn().mockReturnValue({promise: () => Promise.resolve()}),
            }
            const notification = new SnsNotificationRepository('testTopic', snsMock)
            await notification.send('test', {type: 'specialType'})
            expect(snsMock.publish).toHaveBeenCalledTimes(1)
            expect(snsMock.publish).toHaveBeenCalledWith({
                Message: '"test"',
                TopicArn: 'testTopic',
                MessageAttributes: {
                    type: {
                        DataType: 'String',
                        StringValue: 'specialType',
                    },
                },
            })
        })
    })
})
