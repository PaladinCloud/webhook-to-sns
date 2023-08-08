import SNS from 'aws-sdk/clients/sns'
import * as process from 'process'
const sns = new SNS()

interface IMessageAttributes {
  [key: string]: any
}

interface ISnsLib {
  publish: Function
}

export class SnsNotificationRepository {
  public topicArn: string
  public sns: ISnsLib

  constructor(topicArn: string, notificationLib?: ISnsLib) {
    this.topicArn = topicArn
    this.sns = notificationLib || sns
  }

  public async send(message: any, messageAttributes?: IMessageAttributes) {
    const centralInstanceUrl = process.env.centralInstanceUrl
    const body = JSON.parse(message.body)
    const payload = {
      'id': body.alert.id,
      'severity': body.alert.policy.severity,
      'description': body.alert.policy.description,
      'clusterName': body.alert.clusterName,
      'namespace': body.alert.namespace,
      'goToViolation': centralInstanceUrl + body.alert.id,
      'lastUpdated': body.alert.policy.lastUpdated,
    }

    const notificationAttributes = [
      {
        eventId: body.alert.id,
        eventName: body.alert.policy.name,
        eventCategory: 'acs',
        eventCategoryName: 'ACS',
        eventSource: 'redhat',
        eventSourceName: 'Red Hat',
        latest: true.toString(),
        payload,
      },
    ]

    const params: SNS.PublishInput = {
      Message: JSON.stringify(notificationAttributes),
      TopicArn: this.topicArn,
    }

    if (messageAttributes) {
      const attributes: IMessageAttributes = {}
      Object.keys(messageAttributes).forEach((key) => {
        const value = messageAttributes[key]
        attributes[key] = {
          DataType: Array.isArray(value) ? 'String.Array' : (typeof value === 'number' ? 'Number' : 'String'),
          StringValue: value,
        }
      })
      params.MessageAttributes = attributes
    }
    return this.sns.publish(params).promise()
  }
}
